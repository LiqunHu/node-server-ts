import { Request } from 'express'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { simpleSelect } from '@app/db'
import {
  common_usergroup,
  common_usergroupmenu,
  common_user_groups,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

interface menuItem {
  systemmenu_id: number
  systemmenu_name?: string
  node_type: string
  name: string
  isParent: boolean
  title: string
  expand?: boolean
  api_id?: number
  parent_id?: number
  children?: menuItem[]
}
async function initAct() {
  let returnData = Object.create(null)

  returnData.menuInfo = [
    {
      systemmenu_id: 0,
      name: '根目录',
      isParent: true,
      title: '根目录',
      expand: true,
      node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      children: [],
    },
  ]

  returnData.menuInfo[0].children = await genMenu('0')
  return common.success(returnData)
}

async function genMenu(parentId: number | string): Promise<menuItem[]> {
  let return_list: menuItem[] = []
  let queryStr = `SELECT
                    a.*, b.api_type, 
                    b.api_function
                  FROM
                    tbl_common_systemmenu a
                  LEFT JOIN tbl_common_api b ON a.api_id = b.api_id
                  WHERE a.parent_id = ?
                  ORDER BY
                    a.systemmenu_index`
  let menus = await simpleSelect(queryStr, [parentId])

  for (let m of menus) {
    let sub_menus: menuItem[] = []
    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_menus = await genMenu(m.systemmenu_id)
      return_list.push({
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        node_type: m.node_type,
        name: m.systemmenu_name,
        isParent: true,
        title: m.systemmenu_name,
        expand: true,
        parent_id: m.parent_id,
        children: sub_menus,
      })
    } else {
      return_list.push({
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        api_id: m.api_id,
        node_type: m.node_type,
        name: m.systemmenu_name + '->' + m.api_function,
        title: m.systemmenu_name + '->' + m.api_function,
        isParent: false,
        parent_id: m.parent_id,
      })
    }
  }
  return return_list
}

async function searchAct() {
  let groups = [
    {
      usergroup_id: 0,
      name: '总机构',
      isParent: true,
      title: '根目录',
      expand: true,
      node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      children: [],
    },
  ]
  groups[0].children = JSON.parse(JSON.stringify(await genUserGroup('0')))
  return common.success(groups)
}
async function genUserGroup(parentId: string): Promise<any> {
  let return_list = []
  let groups = await common_usergroup.find({
    parent_id: parentId,
    organization_id: 0,
    usergroup_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
  })
  for (let g of groups) {
    let sub_group = []
    if (g.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_group = await genUserGroup(g.usergroup_id + '')
      return_list.push({
        usergroup_id: g.usergroup_id,
        node_type: g.node_type,
        usergroup_type: g.usergroup_type,
        name: g.usergroup_name,
        isParent: true,
        title: g.usergroup_name,
        expand: true,
        parent_id: g.parent_id,
        children: sub_group,
      })
    } else {
      return_list.push({
        usergroup_id: g.usergroup_id,
        node_type: g.node_type,
        usergroup_type: g.usergroup_type,
        usergroup_code: g.usergroup_code,
        name: g.usergroup_name,
        title: g.usergroup_name,
        isParent: false,
        parent_id: g.parent_id,
      })
    }
  }
  return return_list
}

async function getCheckAct(req: Request) {
  let doc = common.docValidate(req)
  let returnData = Object.create(null)
  returnData.groupMenu = []

  let groupmenus = await common_usergroupmenu.find({
    usergroup_id: doc.usergroup_id,
  })
  for (let item of groupmenus) {
    returnData.groupMenu.push(item.menu_id)
  }
  return common.success(returnData)
}

async function addAct(req: Request) {
  let doc = common.docValidate(req)

  if (doc.node_type === '01') {
    let gcode = await common_usergroup.findOne({
      usergroup_code: doc.usergroup_code,
    })

    if (gcode) {
      return common.error('group_05')
    }
  }

  let usergroup = await common_usergroup.create({
    organization_id: 0,
    usergroup_code: doc.usergroup_code,
    usergroup_name: doc.usergroup_name,
    usergroup_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
    node_type: doc.node_type,
    parent_id: doc.parent_id,
  })

  if (doc.node_type === '01') {
    for (let m of doc.menus) {
      await common_usergroupmenu.create({
        usergroup_id: usergroup.usergroup_id,
        menu_id: m.menu_id,
      })
    }
  }

  return common.success(usergroup)
}

async function modifyAct(req: Request) {
  let doc = common.docValidate(req)
  let usergroup = await common_usergroup.findOne({
    usergroup_id: doc.usergroup_id,
  })
  if (usergroup) {
    usergroup.usergroup_name = doc.usergroup_name
    await usergroup.save()

    if (usergroup.node_type === '01') {
      let usergroupmenu = new common_usergroupmenu()
      usergroupmenu.usergroup_id = doc.usergroup_id
      await usergroupmenu.remove()

      for (let m of doc.menus) {
        await common_usergroupmenu.create({
          usergroup_id: usergroup.usergroup_id,
          menu_id: m.menu_id,
        })
      }
    }
    logger.debug('modify success')
    return common.success(usergroup)
  } else {
    return common.error('group_02')
  }
}

async function removeAct(req: Request) {
  let doc = common.docValidate(req)
  let usergroup = await common_usergroup.findOne({
    usergroup_id: doc.usergroup_id,
  })

  if (usergroup) {
    if (usergroup.node_type === '01') {
      let user_groups = new common_user_groups()
      user_groups.usergroup_id = usergroup.usergroup_id
      await user_groups.remove()

      let usergroupmenu = new common_usergroupmenu()
      usergroupmenu.usergroup_id = usergroup.usergroup_id
      await usergroupmenu.remove()
      await usergroup.remove()
      return common.success()
    } else {
      let chcount = await common_usergroup.count({
        where: {
          parent_id: usergroup.usergroup_id,
        },
      })

      if (chcount > 0) {
        return common.error('group_06')
      }
      await usergroup.remove()
      return common.success()
    }
  }
}

export default {
  initAct,
  searchAct,
  getCheckAct,
  addAct,
  modifyAct,
  removeAct,
}
