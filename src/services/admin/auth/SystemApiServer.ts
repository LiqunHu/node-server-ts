import { Not, In } from 'typeorm'
import { Request } from 'express'
import _ from 'lodash'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import refreshRedis from '@schedule/refreshRedis'
import { simpleSelect } from '@app/db'
import {
  common_systemmenu,
  common_api,
  common_usergroup,
  common_usergroupmenu,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function initAct() {
  let returnData = {
    authInfo: GLBConfig.AUTHINFO,
    tfInfo: GLBConfig.TFINFO,
  }

  return common.success(returnData)
}

async function searchAct() {
  let menus = [
    {
      name: '根目录',
      systemmenu_id: 0,
      node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      children: [],
    },
  ]
  menus[0].children = JSON.parse(JSON.stringify(await genMenu('0')))
  return common.success(menus)
}

async function genMenu(parentId: string): Promise<any> {
  let return_list = []
  let queryStr = `SELECT
                    a.*, b.api_type, 
                    b.api_function,
                    b.api_path,
                    b.auth_flag,
                    b.api_remark
                  FROM
                    tbl_common_systemmenu a
                  LEFT JOIN tbl_common_api b ON a.api_id = b.api_id
                  WHERE a.parent_id = ?
                  ORDER BY
                    a.systemmenu_index`
  let menus = await simpleSelect(queryStr, [parentId])
  for (let m of menus) {
    let sub_menus = []
    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_menus = await genMenu(m.systemmenu_id)
      return_list.push({
        name: m.systemmenu_name,
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        systemmenu_icon: m.systemmenu_icon,
        node_type: m.node_type,
        parent_id: m.parent_id,
        children: sub_menus,
      })
    } else {
      let name = ''
      if (m.api_function) {
        name = m.systemmenu_name + '->' + m.api_function
      } else {
        name = m.systemmenu_name
      }
      return_list.push({
        name: name,
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        api_id: m.api_id,
        api_type: m.api_type,
        api_path: m.api_path,
        api_function: m.api_function,
        auth_flag: m.auth_flag,
        api_remark: m.api_remark,
        node_type: m.node_type,
        parent_id: m.parent_id,
      })
    }
  }
  return return_list
}

async function addFolderAct(req: Request) {
  let doc = common.docValidate(req)
  let folder = await common_systemmenu.findOneBy({
      systemmenu_name: doc.systemmenu_name,
  })

  if (folder) {
    return common.error('common_api_01')
  } else {
    await common_systemmenu.create({
      systemmenu_name: doc.systemmenu_name,
      systemmenu_icon: doc.systemmenu_icon,
      node_type: '00', //NODETYPEINFO
      parent_id: doc.parent_id,
    }).save()

    return common.success()
  }
}

async function modifyFolderAct(req: Request) {
  let doc = common.docValidate(req)

  let folder = await common_systemmenu.findOneBy({
    systemmenu_id: doc.systemmenu_id,
  })

  if (folder) {
    folder.systemmenu_name = doc.systemmenu_name
    folder.systemmenu_icon = doc.systemmenu_icon
    await folder.save()
  } else {
    return common.error('common_api_02')
  }
  logger.debug('modify success')
  return common.success()
}

async function addMenuAct(req: Request) {
  let doc = common.docValidate(req)

  let afolder = await common_systemmenu.findOneBy({
    systemmenu_name: doc.systemmenu_name,
  })

  let aapi = await common_api.findOneBy({
    api_name: doc.systemmenu_name,
  })

  let afunc = null
  if (doc.api_function) {
    afunc = await common_api.findOneBy({
      api_function: doc.api_function,
    })
  }
  if (afolder || aapi || afunc) {
    return common.error('common_api_01')
  } else {
    let api_path = '',
      api_function = '',
      auth_flag = ''
    if (doc.api_type === '0') {
      api_path = doc.api_path
      api_function = doc.api_function.toUpperCase()
      auth_flag = doc.auth_flag
    } else if (doc.api_type === '1') {
      api_path = doc.api_path
    } else if (doc.api_type === '2') {
      api_function = doc.api_function.toUpperCase()
      auth_flag = doc.auth_flag
    }

    let api = await common_api.create({
      api_name: doc.systemmenu_name,
      api_type: doc.api_type,
      api_path: api_path,
      api_function: api_function,
      auth_flag: auth_flag,
    }).save()

    await common_systemmenu.create({
      systemmenu_name: doc.systemmenu_name,
      api_id: api.api_id,
      node_type: '01', //NODETYPEINFO
      parent_id: doc.parent_id,
    }).save()

    await refreshRedis.refreshRedis()
  }

  return common.success()
}

async function modifyMenuAct(req: Request) {
  let doc = common.docValidate(req)

  let menum = await common_systemmenu.findOneBy({
    systemmenu_id: doc.systemmenu_id,
  })

  if (menum) {
    let api = await common_api.findOneBy({
      api_id: menum.api_id,
    })

    let orCond: { [index: string]: any }[] = [
      { api_name: doc.systemmenu_name, api_id: Not(menum.api_id) },
    ]
    if (doc.api_function) {
      orCond.push({ api_function: doc.api_function, api_id: Not(menum.api_id) })
    }
    if (doc.api_path) {
      orCond.push({ api_path: doc.api_path, api_id: Not(menum.api_id) })
    }

    let aapi = await common_api.findOne({
      where: orCond,
    })
    if (aapi) {
      return common.error('common_api_01')
    }

    if (api) {
      let api_path = '',
        api_function = '',
        auth_flag = ''
      if (doc.api_type === '0') {
        api_path = doc.api_path
        api_function = doc.api_function.toUpperCase()
        auth_flag = doc.auth_flag
      } else if (doc.api_type === '1') {
        api_path = doc.api_path
      } else if (doc.api_type === '2') {
        api_function = doc.api_function.toUpperCase()
        auth_flag = doc.auth_flag
      }

      api.api_type = doc.api_type
      api.api_name = doc.systemmenu_name
      api.api_path = api_path
      api.api_function = api_function
      api.auth_flag = auth_flag
      await api.save()
      menum.systemmenu_name = doc.systemmenu_name
      await menum.save()
      await refreshRedis.refreshRedis()
    } else {
      return common.error('common_api_02')
    }
  } else {
    return common.error('common_api_02')
  }

  return common.success()
}

async function removeAct(req: Request) {
  let doc = common.docValidate(req)
  let menum = await common_systemmenu.findOneBy({
    systemmenu_id: doc.systemmenu_id,
  })

  let groups = await common_usergroup.findBy({
    organization_id: 0,
  })

  let gids = []
  for (let g of groups) {
    gids.push(g.usergroup_id)
  }

  if (menum) {
    if (menum.node_type === '01') {
      if (gids.length > 0) {
        await common_usergroupmenu.delete({
          usergroup_id: In(gids),
          menu_id: menum.systemmenu_id,
        })
      }

      await common_systemmenu.delete({
        systemmenu_id: menum.systemmenu_id,
      })

      if (menum.api_id) {
        await common_api.delete({
          api_id: menum.api_id,
        })
      }
      return common.success()
    } else {
      let chcount = await common_systemmenu.count({
        where: {
          parent_id: doc.systemmenu_id,
        },
      })
      if (chcount > 0) {
        return common.error('common_api_04')
      }

      if (gids.length > 0) {
        await common_usergroupmenu.delete({
          usergroup_id: In(gids),
          menu_id: menum.systemmenu_id,
        })
      }

      await common_systemmenu.delete({
        systemmenu_id: menum.systemmenu_id,
      })

      return common.success()
    }
  }
}

export default {
  initAct,
  searchAct,
  addFolderAct,
  modifyFolderAct,
  addMenuAct,
  modifyMenuAct,
  removeAct,
}
