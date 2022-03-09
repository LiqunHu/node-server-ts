import { Request } from 'express'
import _ from 'lodash'
import dayjs from 'dayjs'
import config from 'config'
import { redisClient, authority } from 'server-utils'
import { simpleSelect } from '@app/db'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import {
  common_user,
  common_user_groups,
  common_usergroup,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function signinAct(req: Request) {
  let doc = await common.docValidate(req)

  if (
    doc.login_type === 'WEB' ||
    doc.login_type === 'ADMIN' ||
    doc.login_type === 'MOBILE' ||
    doc.login_type === 'SYSTEM'
  ) {
    let user = await common_user.findOne({
      where: [{ user_phone: doc.username }, { user_username: doc.username }]
    })

    if (!user) {
      return common.error('auth_03')
    }

    let decrypted = authority.aesDecryptModeCFB(
      doc.identify_code,
      user.user_password,
      doc.magic_no
    )

    if (!(decrypted == user.user_username)) {
      return common.error('auth_03')
    } else {
      let session_token = authority.user2token(doc.login_type, user.user_id)
      let loginData = await loginInit(user, session_token, doc.login_type)

      if (loginData) {
        loginData.Authorization = session_token
        return common.success(loginData)
      } else {
        return common.error('auth_03')
      }
    }
  } else {
    return common.error('auth_19')
  }
}

async function loginInit(
  user: common_user,
  session_token: string,
  type: string
) {
  try {
    let returnData = Object.create(null)
    returnData.avatar = user.user_avatar
    returnData.user_id = user.user_id
    returnData.username = user.user_username
    returnData.name = user.user_name
    returnData.phone = user.user_phone
    returnData.created_at = dayjs(user.created_at).format('MM[, ]YYYY')
    returnData.city = user.user_city

    let groups = await common_user_groups.find({
      user_id: user.user_id,
    })

    if (groups.length > 0) {
      let gids = []
      returnData.groups = []
      for (let g of groups) {
        gids.push(g.usergroup_id)
        let usergroup = await common_usergroup.findOne({
          usergroup_id: g.usergroup_id,
        })
        if (usergroup && usergroup.usergroup_code) {
          returnData.groups.push(usergroup.usergroup_code)
        }
      }
      if (type === 'MOBILE' || type === 'WEIXIN') {
        returnData.menulist = await genDashboard(gids)
      } else {
        returnData.menulist = await iterationMenu(user, gids, 0)
      }

      // prepare redis Cache
      let authApis = []
      authApis.push({
        api_name: '用户设置',
        api_path: '/common/user/UserSetting',
        api_function: 'USERSETTING',
        auth_flag: '1',
        show_flag: '1',
      })
      if (user.user_type === GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR) {
        authApis.push({
          api_name: '系统菜单维护',
          api_path: '/admin/auth/SystemApiControl',
          api_function: 'SYSTEMAPICONTROL',
          auth_flag: '1',
          show_flag: '1',
        })

        authApis.push({
          api_name: '角色组维护',
          api_path: '/admin/auth/GroupControl',
          api_function: 'GROUPCONTROL',
          auth_flag: '1',
          show_flag: '1',
        })

        authApis.push({
          api_name: '用户维护',
          api_path: '/admin/auth/OperatorControl',
          api_function: 'OPERATORCONTROL',
          auth_flag: '1',
          show_flag: '1',
        })

        authApis.push({
          api_name: '重置密码',
          api_path: '/admin/auth/ResetPassword',
          api_function: 'RESETPASSWORD',
          auth_flag: '1',
          show_flag: '1',
        })
      } else {
        let groupapis = await queryGroupApi(gids)
        for (let item of groupapis) {
          authApis.push({
            api_name: item.api_name,
            api_path: item.api_path,
            api_function: item.api_function,
            auth_flag: item.auth_flag,
            show_flag: item.show_flag,
          })
        }
      }
      let expired = null
      if (type === 'MOBILE' || type === 'WEIXIN') {
        expired = config.get<number>('security.MOBILE_TOKEN_AGE') / 1000
      } else {
        expired = config.get<number>('security.TOKEN_AGE') / 1000
      }
      let usercache = JSON.parse(JSON.stringify(user))
      delete usercache.user_password
      await redisClient.set(
        [GLBConfig.REDIS_KEYS.AUTH, type, user.user_id].join('_'),
        {
          session_token: session_token,
          user: usercache,
          authApis: authApis,
        },
        'EX',
        expired
      )

      return returnData
    } else {
      return null
    }
  } catch (error) {
    logger.error(error)
    return null
  }
}

const queryGroupApi = async (groups: number[]) => {
  try {
    // prepare redis Cache
    let queryStr = `select DISTINCT c.api_name, c.api_path, c.api_function, c.auth_flag, c.show_flag 
          from tbl_common_usergroupmenu a, tbl_common_systemmenu b, tbl_common_api c
          where a.systemmenu_id = b.systemmenu_id
          and b.api_id = c.api_id
          and a.usergroup_id in (?)
          and b.state = '1'`

    let replacements = [groups]
    let groupmenus = await simpleSelect(queryStr, replacements)
    return groupmenus
  } catch (error) {
    logger.error(error)
    return []
  }
}

interface menuItem {
  menu_id?: number
  menu_type: string
  menu_name: string
  menu_path?: string
  menu_icon?: string
  show_flag?: string
  sub_menu?: menuItem[]
}
async function iterationMenu(
  user: common_user,
  groups: number[],
  parent_id: number
): Promise<menuItem[]> {
  if (user.user_type === GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR) {
    let return_list: menuItem[] = []
    return_list.push({
      menu_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      menu_name: '权限管理',
      menu_icon: 'fa-cogs',
      show_flag: '1',
      sub_menu: [],
    })

    if (return_list[0].sub_menu) {
      return_list[0].sub_menu.push({
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: '系统菜单维护',
        show_flag: '1',
        menu_path: '/admin/auth/SystemApiControl',
      })

      return_list[0].sub_menu.push({
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: '角色组维护',
        show_flag: '1',
        menu_path: '/admin/auth/GroupControl',
      })

      return_list[0].sub_menu.push({
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: '用户维护',
        show_flag: '1',
        menu_path: '/admin/auth/OperatorControl',
      })

      return_list[0].sub_menu.push({
        menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
        menu_name: '重置密码',
        show_flag: '1',
        menu_path: '/admin/auth/ResetPassword',
      })
    }

    return return_list
  } else {
    let return_list: menuItem[] = []
    let queryStr = `select distinct b.systemmenu_id, b.node_type,b.systemmenu_name,b.systemmenu_icon, b.systemmenu_index, c.show_flag, c.api_path
        from tbl_common_usergroupmenu a, tbl_common_systemmenu b
          left join tbl_common_api c on b.api_id = c.api_id
          where a.systemmenu_id = b.systemmenu_id
          and a.usergroup_id in (?)
          and b.parent_id = ?
          order by b.systemmenu_index`

    let replacements = [groups, parent_id]
    let menus = await simpleSelect(queryStr, replacements)

    for (let m of menus) {
      let sub_menu: menuItem[] = []

      if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
        sub_menu = await iterationMenu(user, groups, m.systemmenu_id)
      }

      if (m.node_type === GLBConfig.NODE_TYPE.NODE_LEAF) {
        return_list.push({
          menu_id: m.systemmenu_id,
          menu_type: m.node_type,
          menu_name: m.systemmenu_name,
          menu_path: m.api_path,
          menu_icon: m.systemmenu_icon,
          show_flag: m.show_flag,
        })
      } else if (
        m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT &&
        sub_menu.length > 0
      ) {
        return_list.push({
          menu_id: m.systemmenu_id,
          menu_type: m.node_type,
          menu_name: m.systemmenu_name,
          menu_path: m.api_path,
          menu_icon: m.systemmenu_icon,
          show_flag: '1',
          sub_menu: sub_menu,
        })
      }
    }
    return return_list
  }
}

const genDashboard = async (groups: number[]) => {
  let return_list = []
  let queryStr = `select distinct b.systemmenu_id, b.systemmenu_name, b.systemmenu_mobile_icon, b.systemmenu_mobile_backcolor, c.api_path, c.api_function
        from tbl_common_usergroupmenu a, tbl_common_systemmenu b
          left join tbl_common_api c on b.api_id = c.api_id
          where a.systemmenu_id = b.systemmenu_id
          and b.node_type = '01'
          and b.systemmenu_mobile_icon != ''
          and a.usergroup_id in (?)`
  let replacements = [groups]
  let menus = await simpleSelect(queryStr, replacements)

  for (let m of menus) {
    return_list.push({
      menu_id: m.systemmenu_id,
      menu_name: m.systemmenu_name,
      menu_path: m.api_path,
      menu_function: m.api_function,
      menu_icon: m.systemmenu_mobile_icon,
      menu_backcolor: m.systemmenu_mobile_backcolor,
    })
  }
  return return_list
}

export default {
  signinAct,
}
