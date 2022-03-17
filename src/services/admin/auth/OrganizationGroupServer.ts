import { Request } from 'express'
import _ from 'lodash'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { simpleSelect } from '@app/db'
import {
  common_organization,
  common_usergroup,
  common_usergroupmenu,
  common_user_groups,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function initAct(req: Request) {
  let user = req.user,
    returnData = Object.create(null)

  returnData.menuInfo = [
    {
      organizationmenu_id: 0,
      name: '根目录',
      isParent: true,
      title: '根目录',
      expand: true,
      node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      children: [],
    },
  ]

  returnData.menuInfo[0].children = await genMenu(
    user.default_organization,
    '0'
  )
  return common.success(returnData)
}

async function genMenu(
  organization_id: number,
  parentId: string
): Promise<any> {
  let return_list = []
  let queryStr = `SELECT
                    a.*, b.api_type, 
                    b.api_function
                  FROM
                    tbl_common_organizationmenu a
                  LEFT JOIN tbl_common_api b ON a.api_id = b.api_id
                  WHERE a.organization_id = ?
                  AND a.parent_id = ?
                  ORDER BY
                    a.organizationmenu_index`
  let menus = await simpleSelect(queryStr, [organization_id, parentId])

  for (let m of menus) {
    let sub_menus = []
    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_menus = await genMenu(organization_id, m.organizationmenu_id)
      return_list.push({
        organizationmenu_id: m.organizationmenu_id,
        organizationmenu_name: m.organizationmenu_name,
        node_type: m.node_type,
        name: m.organizationmenu_name,
        isParent: true,
        title: m.organizationmenu_name,
        expand: true,
        parent_id: m.parent_id,
        children: sub_menus,
      })
    } else {
      return_list.push({
        organizationmenu_id: m.organizationmenu_id,
        organizationmenu_name: m.organizationmenu_name,
        api_id: m.api_id,
        node_type: m.node_type,
        name: m.organizationmenu_name + '->' + m.api_function,
        title: m.organizationmenu_name + '->' + m.api_function,
        isParent: false,
        parent_id: m.parent_id,
      })
    }
  }
  return return_list
}

async function searchAct(req: Request) {
  let user = req.user
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
  groups[0].children = await genUserGroup(user.default_organization, '0')
  return common.success(groups)
}

async function genUserGroup(
  organization_id: number,
  parentId: string
): Promise<any> {
  let return_list = []
  let groups = await common_usergroup.find({
    organization_id: organization_id,
    parent_id: parentId,
    usergroup_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
  })
  for (let g of groups) {
    let sub_group = []
    if (g.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_group = await genUserGroup(organization_id, g.usergroup_id + '')
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
  let user = req.user,
    doc = common.docValidate(req)

  let org = await common_organization.findOne({
    organization_id: user.default_organization,
  })

  if (!org) {
    return common.error('group_07')
  }

  let gcoude = ''
  if (doc.node_type === '01') {
    gcoude = org.organization_code + doc.usergroup_code
    let gcode = await common_usergroup.findOne({
      usergroup_code: gcoude,
    })

    if (gcode) {
      return common.error('group_05')
    }
  }

  let usergroup = await common_usergroup.create({
    organization_id: user.default_organization,
    usergroup_code: gcoude,
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
      await common_usergroupmenu.delete({
        usergroup_id: doc.usergroup_id,
      })

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
      await common_user_groups.delete({
        usergroup_id: usergroup.usergroup_id,
      })

      await common_usergroupmenu.delete({
        usergroup_id: usergroup.usergroup_id,
      })

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
