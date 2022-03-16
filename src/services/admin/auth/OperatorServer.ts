import { Not } from 'typeorm'
import { Request } from 'express'
import { redisClient } from 'node-srv-utils'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { simpleSelect, queryWithCount } from '@app/db'

import {
  common_user,
  common_usergroup,
  common_user_groups,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function initAct() {
  let returnData = Object.create(null)

  let groups: {
    id: number
    text: string
    disabled: boolean
  }[] = []

  async function genUserGroup(parentId: string, lev: number) {
    let actgroups = await common_usergroup.find({
      parent_id: parentId,
      usergroup_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
      organization_id: 0,
    })
    for (let g of actgroups) {
      if (g.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
        groups.push({
          id: g.usergroup_id,
          text: '--'.repeat(lev) + g.usergroup_name,
          disabled: true,
        })
        await genUserGroup(g.usergroup_id + '', lev + 1)
      } else {
        groups.push({
          id: g.usergroup_id,
          text: '--'.repeat(lev) + g.usergroup_name,
          disabled: false,
        })
      }
    }
  }

  await genUserGroup('0', 0)
  returnData.groupInfo = groups

  return common.success(returnData)
}

async function searchAct(req: Request) {
  let doc = common.docValidate(req),
    returnData = Object.create(null)

  let queryStr =
    'select * from tbl_common_user where state = "1" and user_type = "' +
    GLBConfig.USER_TYPE.TYPE_DEFAULT +
    '"'
  let replacements = []

  if (doc.search_text) {
    queryStr +=
      ' and (user_username like ? or user_email like ? or user_phone like ? or user_name like ? or user_address like ?)'
    let search_text = '%' + doc.search_text + '%'
    replacements.push(search_text)
    replacements.push(search_text)
    replacements.push(search_text)
    replacements.push(search_text)
    replacements.push(search_text)
  }

  let result = await queryWithCount(doc, queryStr, replacements)

  returnData.total = result.count
  returnData.rows = []

  for (let ap of result.data) {
    ap.user_groups = []
    let user_groups = await common_user_groups.find({
      user_id: ap.user_id,
    })
    for (let g of user_groups) {
      ap.user_groups.push(g.usergroup_id)
    }
    delete ap.user_password
    returnData.rows.push(ap)
  }

  return common.success(returnData)
}

async function addAct(req: Request) {
  let doc = common.docValidate(req)
  let groupCheckFlag = true

  for (let gid of doc.user_groups) {
    let usergroup = await common_usergroup.findOne({
      usergroup_id: gid,
    })
    if (!usergroup) {
      groupCheckFlag = false
      break
    }
  }

  if (groupCheckFlag) {
    let adduser = await common_user.findOne({
      where: [
        { user_phone: doc.user_phone },
        { user_username: doc.user_username },
      ],
    })
    if (adduser) {
      return common.error('operator_02')
    }
    adduser = await common_user.create({
      user_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
      user_username: doc.user_username,
      user_email: doc.user_email,
      user_phone: doc.user_phone,
      user_password: GLBConfig.INITPASSWORD,
      user_name: doc.user_name,
      user_gender: doc.user_gender,
      user_address: doc.user_address,
      user_zipcode: doc.user_zipcode,
    })

    for (let gid of doc.user_groups) {
      await common_user_groups.create({
        user_id: adduser.user_id,
        usergroup_id: gid,
      })
    }

    let returnData = JSON.parse(JSON.stringify(adduser))
    delete returnData.user_password
    returnData.user_groups = doc.user_groups

    return common.success(returnData)
  } else {
    return common.error('operator_01')
  }
}

async function modifyAct(req: Request) {
  let doc = common.docValidate(req)

  let modiuser = await common_user.findOne({
    user_id: doc.old.user_id,
    state: GLBConfig.ENABLE,
  })
  if (modiuser) {
    if (doc.new.user_email) {
      let emailuser = await common_user.findOne({
        user_id: Not(modiuser.user_id),
        user_email: doc.new.user_email,
      })
      if (emailuser) {
        return common.error('operator_02')
      }
    }

    if (doc.new.user_phone) {
      let phoneuser = await common_user.findOne({
        where: {
          user_id: Not(modiuser.user_id),
          user_phone: doc.new.user_phone,
        },
      })
      if (phoneuser) {
        return common.error('operator_02')
      }
    }

    modiuser.user_email = doc.new.user_email
    modiuser.user_phone = doc.new.user_phone
    modiuser.user_name = doc.new.user_name
    modiuser.user_gender = doc.new.user_gender
    modiuser.user_avatar = doc.new.user_avatar
    modiuser.user_address = doc.new.user_address
    modiuser.user_zipcode = doc.new.user_zipcode
    await modiuser.save()

    let queryStr = `SELECT
        a.user_groups_id,
        a.usergroup_id 
      FROM
        tbl_common_user_groups a,
        tbl_common_usergroup b 
      WHERE
        a.usergroup_id = b.usergroup_id 
        AND b.organization_id = 0 
        AND a.user_id = ?`
    let groups = await simpleSelect(queryStr, [modiuser.user_id])
    let existids = []
    for (let g of groups) {
      if (doc.new.user_groups.indexOf(g.usergroup_id) < 0) {
        await common_user_groups.delete({
          user_groups_id: g.user_groups_id,
        })
      } else {
        existids.push(g.usergroup_id)
      }
    }

    for (let gid of doc.new.user_groups) {
      if (existids.indexOf(gid) < 0) {
        await common_user_groups.create({
          user_id: modiuser.user_id,
          usergroup_id: gid,
        })
      }
    }

    let returnData = JSON.parse(JSON.stringify(modiuser))
    delete returnData.user_password
    returnData.user_groups = doc.new.user_groups
    logger.debug('modify success')
    return common.success(returnData)
  } else {
    return common.error('operator_03')
  }
}

async function deleteAct(req: Request) {
  let doc = common.docValidate(req)

  let deluser = await common_user.findOne({
    user_id: doc.user_id,
    state: GLBConfig.ENABLE,
  })

  if (deluser) {
    deluser.state = GLBConfig.DISABLE
    await deluser.save()
    redisClient.del(
      [GLBConfig.REDIS_KEYS.AUTH, 'WEB', deluser.user_id].join('_')
    )
    redisClient.del(
      [GLBConfig.REDIS_KEYS.AUTH, 'MOBILE', deluser.user_id].join('_')
    )
    return common.success()
  } else {
    return common.error('operator_03')
  }
}

export default {
  initAct,
  searchAct,
  addAct,
  modifyAct,
  deleteAct,
}
