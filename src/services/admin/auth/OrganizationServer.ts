import { Request } from 'express'
import _ from 'lodash'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { simpleSelect, queryWithCount } from '@app/db'
import {
  common_organization,
  common_organizationtemplate,
  common_templatemenu,
  common_organizationmenu,
  common_user,
  common_organization_user,
  common_usergroup,
  common_user_groups,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function initAct() {
  let returnData = Object.create(null)

  let templates = await common_organizationtemplate.find({})

  returnData.templateInfo = []
  for (let t of templates) {
    returnData.templateInfo.push({
      id: t.organizationtemplate_id,
      text: t.organizationtemplate_name,
    })
  }

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

  returnData.menuInfo[0].children = JSON.parse(JSON.stringify(await genMenu('0')))

  return common.success(returnData)
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
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        systemmenu_icon: m.systemmenu_icon,
        node_type: m.node_type,
        name: m.systemmenu_name,
        isParent: true,
        title: m.systemmenu_name,
        expand: true,
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
        systemmenu_id: m.systemmenu_id,
        systemmenu_name: m.systemmenu_name,
        api_id: m.api_id,
        api_type: m.api_type,
        api_path: m.api_path,
        api_function: m.api_function,
        auth_flag: m.auth_flag,
        api_remark: m.api_remark,
        node_type: m.node_type,
        name: name,
        title: name,
        isParent: false,
        parent_id: m.parent_id,
      })
    }
  }
  return return_list
}

async function searchAct(req: Request) {
  let doc = common.docValidate(req),
    returnData = Object.create(null)

  let queryStr = 'select * from tbl_common_organization where state = "1" and organization_type = "01"'
  let replacements = []

  if (doc.search_text) {
    queryStr += ' and (organization_name like ? or organization_code like ?)'
    let search_text = '%' + doc.search_text + '%'
    replacements.push(search_text)
    replacements.push(search_text)
  }

  let result = await queryWithCount(doc, queryStr, replacements)

  returnData.total = result.count
  returnData.rows = result.data

  return common.success(returnData)
}

async function addAct(req: Request) {
  let doc = common.docValidate(req)
  let org = await common_organization.findOne({
    where: [{ organization_code: doc.organization_code }, { organization_name: doc.organization_name }],
  })

  if (org) {
    return common.error('org_01')
  } else {
    org = await common_organization
      .create({
        organization_type: GLBConfig.ORG_TYPE.TYPE_DEFAULT,
        organization_name: doc.organization_name,
        organization_code: doc.organization_code,
        organizationtemplate_id: doc.organizationtemplate_id,
      })
      .save()

    if (doc.organizationtemplate_id) {
      await createOrganizationMenu(org.organization_id, doc.organizationtemplate_id, '0', '0')
    }

    let adduser = await common_user
      .create({
        user_type: GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR,
        user_username: doc.organization_code + 'admin',
        user_password: 'admin',
        user_name: doc.organization_name,
      })
      .save()

    await common_organization_user
      .create({
        organization_id: org.organization_id,
        user_id: adduser.user_id,
        organization_user_default_flag: '1',
      })
      .save()

    let group = await common_usergroup.findOneBy({
      usergroup_code: 'DEFAULT',
    })
    if (group) {
      await common_user_groups
        .create({
          user_id: adduser.user_id,
          usergroup_id: group.usergroup_id,
        })
        .save()
    }
  }
  return common.success()
}

async function createOrganizationMenu(organization_id: number, organizationtemplate_id: number, parentId: string, cparentId: string) {
  let menus = await common_templatemenu.findBy({
    organizationtemplate_id: organizationtemplate_id,
    parent_id: parentId,
  })
  for (let m of menus) {
    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      let dm = await common_organizationmenu
        .create({
          organization_id: organization_id,
          organizationmenu_name: m.templatemenu_name,
          organizationmenu_icon: m.templatemenu_icon,
          organizationmenu_index: m.templatemenu_index,
          api_id: m.api_id,
          node_type: m.node_type,
          parent_id: cparentId,
        })
        .save()
      await createOrganizationMenu(organization_id, organizationtemplate_id, m.templatemenu_id + '', dm.organizationmenu_id + '')
    } else {
      await common_organizationmenu
        .create({
          organization_id: organization_id,
          organizationmenu_name: m.templatemenu_name,
          organizationmenu_icon: m.templatemenu_icon,
          organizationmenu_index: m.templatemenu_index,
          api_id: m.api_id,
          node_type: m.node_type,
          parent_id: cparentId,
        })
        .save()
    }
  }
}

async function getOrganizationMenuAct(req: Request) {
  let doc = common.docValidate(req),
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

  returnData.menuInfo[0].children = JSON.parse(JSON.stringify(await genOrganizationMenu(doc.organization_id, '0')))
  return common.success(returnData)
}

async function genOrganizationMenu(organization_id: number, parentId: string): Promise<any> {
  let return_list = []
  let queryStr = `SELECT
                    a.*, b.api_type, 
                    b.api_function,
                    b.api_path,
                    b.auth_flag,
                    b.api_remark
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
      sub_menus = await genOrganizationMenu(organization_id, m.organizationmenu_id)
      return_list.push({
        organizationmenu_id: m.organizationmenu_id,
        organizationmenu_name: m.organizationmenu_name,
        organizationmenu_icon: m.organizationmenu_icon,
        node_type: m.node_type,
        name: m.organizationmenu_name,
        isParent: true,
        title: m.organizationmenu_name,
        expand: true,
        parent_id: m.parent_id,
        children: sub_menus,
      })
    } else {
      let name = ''
      if (m.api_function) {
        name = m.organizationmenu_name + '->' + m.api_function
      } else {
        name = m.organizationmenu_name
      }
      return_list.push({
        organizationmenu_id: m.organizationmenu_id,
        organizationmenu_name: m.organizationmenu_name,
        api_id: m.api_id,
        api_type: m.api_type,
        api_path: m.api_path,
        api_function: m.api_function,
        auth_flag: m.auth_flag,
        api_remark: m.api_remark,
        node_type: m.node_type,
        name: name,
        title: name,
        isParent: false,
        parent_id: m.parent_id,
      })
    }
  }
  return return_list
}

async function addFolderAct(req: Request) {
  let doc = common.docValidate(req)

  logger.info('add')

  await common_organizationmenu
    .create({
      organization_id: doc.organization_id,
      organizationmenu_name: doc.organizationmenu_name,
      organizationmenu_icon: doc.organizationmenu_icon,
      node_type: '00',
      parent_id: doc.parent_id,
    })
    .save()

  return common.success()
}

async function addMenusAct(req: Request) {
  let doc = common.docValidate(req)

  let menus = await common_organizationmenu.findBy({
    organization_id: doc.organization_id,
    parent_id: doc.parent_id,
  })

  let addItem = []
  for (let i of doc.items) {
    if (_.findIndex(menus, { api_id: i.api_id }) < 0) {
      addItem.push(i)
    }
  }

  for (let i of addItem) {
    await common_organizationmenu
      .create({
        organization_id: doc.organization_id,
        organizationmenu_name: i.organizationmenu_name,
        api_id: i.api_id,
        node_type: '01',
        parent_id: doc.parent_id,
      })
      .save()
  }

  return common.success()
}

async function removeItemAct(req: Request) {
  let doc = common.docValidate(req)

  let item = await common_organizationmenu.findOneBy({
    organizationmenu_id: doc.organizationmenu_id,
  })

  if (item) {
    if (item.node_type === '01') {
      await item.remove()
    } else {
      await rmFolder(item.organizationmenu_id)
    }
  }

  return common.success()
}

async function rmFolder(organizationmenu_id: number) {
  let folder = await common_organizationmenu.findOneBy({
    organizationmenu_id: organizationmenu_id,
  })

  if (folder) {
    let items = await common_organizationmenu.findBy({
      organization_id: folder.organization_id,
      parent_id: folder.organizationmenu_id + '',
    })

    for (let i of items) {
      if (i.node_type === '01') {
        await i.remove()
      } else {
        rmFolder(i.organizationmenu_id)
      }
    }
    folder.remove()
  }
}

export default {
  initAct,
  searchAct,
  addAct,
  getOrganizationMenuAct,
  addFolderAct,
  addMenusAct,
  removeItemAct,
}
