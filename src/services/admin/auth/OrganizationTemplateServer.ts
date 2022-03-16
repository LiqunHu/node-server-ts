import { Request } from 'express'
import _ from 'lodash'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { simpleSelect } from '@app/db'
import {
  common_organizationtemplate,
  common_templatemenu,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

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

  returnData.menuInfo[0].children = JSON.parse(
    JSON.stringify(await genMenu('0'))
  )
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
      sub_menus = await genMenu(m.systemmenu_id + '')
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

async function getTemplateAct(req: Request) {
  let doc = common.docValidate(req)

  let queryStr = `select * from tbl_common_organizationtemplate where '1' = '1' and state = '1'`
  let replacements = []

  if (doc.search_text) {
    queryStr += ' and (organizationtemplate_name like ?)'
    let search_text = '%' + doc.search_text + '%'
    replacements.push(search_text)
  }

  let result = await simpleSelect(queryStr, replacements)

  return common.success(result)
}

async function addTemplateAct(req: Request) {
  let doc = common.docValidate(req)

  let template = await common_organizationtemplate.findOne({
    organizationtemplate_name: doc.organizationtemplate_name,
  })

  if (template) {
    return common.error('template_01')
  } else {
    await common_organizationtemplate.create({
      organizationtemplate_name: doc.organizationtemplate_name,
    })
    return common.success()
  }
}

async function removeTemplateAct(req: Request) {
  let doc = common.docValidate(req)

  await common_templatemenu.delete({
    organizationtemplate_id: doc.organizationtemplate_id
  })

  await common_organizationtemplate.delete({
    organizationtemplate_id: doc.organizationtemplate_id
  })

  return common.success()
}

async function getTemplateMenuAct(req: Request) {
  let doc = common.docValidate(req),
    returnData = Object.create(null)

  returnData.menuInfo = [
    {
      templatemenu_id: 0,
      name: '根目录',
      isParent: true,
      title: '根目录',
      expand: true,
      node_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      children: [],
    },
  ]

  returnData.menuInfo[0].children = await genTemplateMenu(
    doc.organizationtemplate_id,
    '0'
  )
  return common.success(returnData)
}

async function genTemplateMenu(
  organizationtemplate_id: number,
  parentId: string
): Promise<any> {
  let return_list = []
  let queryStr = `SELECT
                    a.*, b.api_type, 
                    b.api_function,
                    b.api_path,
                    b.auth_flag,
                    b.api_remark
                  FROM
                    tbl_common_templatemenu a
                  LEFT JOIN tbl_common_api b ON a.api_id = b.api_id
                  WHERE a.organizationtemplate_id = ?
                  AND a.parent_id = ?
                  ORDER BY
                    a.templatemenu_index`
  let menus = await simpleSelect(queryStr, [organizationtemplate_id, parentId])
  for (let m of menus) {
    let sub_menus = []
    if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
      sub_menus = await genTemplateMenu(
        organizationtemplate_id,
        m.templatemenu_id
      )
      return_list.push({
        templatemenu_id: m.templatemenu_id,
        templatemenu_name: m.templatemenu_name,
        templatemenu_icon: m.templatemenu_icon,
        node_type: m.node_type,
        name: m.templatemenu_name,
        isParent: true,
        title: m.templatemenu_name,
        expand: true,
        parent_id: m.parent_id,
        children: sub_menus,
      })
    } else {
      let name = ''
      if (m.api_function) {
        name = m.templatemenu_name + '->' + m.api_function
      } else {
        name = m.templatemenu_name
      }
      return_list.push({
        templatemenu_id: m.templatemenu_id,
        templatemenu_name: m.templatemenu_name,
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

  await common_templatemenu.create({
    organizationtemplate_id: doc.organizationtemplate_id,
    templatemenu_name: doc.templatemenu_name,
    templatemenu_icon: doc.templatemenu_icon,
    node_type: '00',
    parent_id: doc.parent_id,
  })

  return common.success()
}

async function addMenusAct(req: Request) {
  let doc = common.docValidate(req)

  let menus = await common_templatemenu.find({
    organizationtemplate_id: doc.organizationtemplate_id,
    parent_id: doc.parent_id,
  })

  let addItem = []
  for (let i of doc.items) {
    if (_.findIndex(menus, { api_id: i.api_id }) < 0) {
      addItem.push(i)
    }
  }

  for (let i of addItem) {
    await common_templatemenu.create({
      organizationtemplate_id: doc.organizationtemplate_id,
      templatemenu_name: i.templatemenu_name,
      api_id: i.api_id,
      node_type: '01',
      parent_id: doc.parent_id,
    })
  }

  return common.success()
}

async function removeItemAct(req: Request) {
  let doc = common.docValidate(req)

  let item = await common_templatemenu.findOne({
    templatemenu_id: doc.templatemenu_id,
  })

  if (item) {
    if (item.node_type === '01') {
      await item.remove()
    } else {
      await rmFolder(item.templatemenu_id)
    }
  }

  return common.success()
}

async function rmFolder(templatemenu_id: number) {
  let folder = await common_templatemenu.findOne({
    templatemenu_id: templatemenu_id,
  })

  if (folder) {
    let items = await common_templatemenu.find({
      organizationtemplate_id: folder.organizationtemplate_id,
      parent_id: folder.templatemenu_id + '',
    })

    for (let i of items) {
      if (i.node_type === '01') {
        await i.remove()
      } else {
        rmFolder(i.templatemenu_id)
      }
    }
    folder.remove()
  }
}

export default {
  initAct,
  getTemplateAct,
  addTemplateAct,
  removeTemplateAct,
  getTemplateMenuAct,
  addFolderAct,
  addMenusAct,
  removeItemAct,
}
