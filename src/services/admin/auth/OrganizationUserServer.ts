import { Not, In } from 'typeorm'
import { Request } from 'express'
import _ from 'lodash'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { queryWithCount } from '@app/db'
import {
  common_user,
  common_usergroup,
  common_user_groups,
  common_organization_user,
} from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function initAct(req: Request) {
  let user = req.user,
    returnData = Object.create(null)

  if (!user.default_organization) {
    return common.error('org_02')
  }

  let groups: {
    id: number
    text: string
    disabled: boolean
  }[] = []
  async function genUserGroup(
    organization_id: number,
    parentId: string,
    lev: number
  ) {
    let actgroups = await common_usergroup.find({
      organization_id: organization_id,
      parent_id: parentId,
      usergroup_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
    })
    for (let g of actgroups) {
      if (g.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
        groups.push({
          id: g.usergroup_id,
          text: '--'.repeat(lev) + g.usergroup_name,
          disabled: true,
        })
        await genUserGroup(organization_id, g.usergroup_id + '', lev + 1)
      } else {
        groups.push({
          id: g.usergroup_id,
          text: '--'.repeat(lev) + g.usergroup_name,
          disabled: false,
        })
      }
    }
  }
  await genUserGroup(user.default_organization, '0', 0)
  returnData.groupInfo = groups

  return common.success(returnData)
}

async function searchAct(req: Request) {
  let user = req.user,
    doc = common.docValidate(req),
    returnData = Object.create(null)

  if (!user.default_organization) {
    return common.error('org_02')
  }

  let queryStr = `select b.user_id , b.user_name , b.user_phone , b.user_email , b.user_avatar from tbl_common_organization_user a , tbl_common_user b 
  WHERE a.organization_id = ? AND a.user_id = b.user_id AND b.state = "1" AND b.user_type = "00"`
  let replacements = [user.default_organization]

  if (doc.search_text) {
    queryStr +=
      ' and (b.user_email like ? or b.user_phone like ? or user_name like ?)'
    let search_text = '%' + doc.search_text + '%'
    replacements.push(search_text)
    replacements.push(search_text)
    replacements.push(search_text)
  }

  let result = await queryWithCount(doc, queryStr, replacements)

  returnData.total = result.count
  returnData.rows = []

  let domaingroups = await common_usergroup.find({
    organization_id: user.default_organization,
    node_type: '01',
  })

  let ids: number[] = []
  for (let g of domaingroups) {
    ids.push(g.usergroup_id)
  }

  for (let ap of result.data) {
    ap.user_groups = []
    let user_groups = await common_user_groups.find({
      user_id: ap.user_id,
      usergroup_id: Not(In(ids)),
    })
    for (let g of user_groups) {
      ap.user_groups.push(g.usergroup_id)
    }
    returnData.rows.push(ap)
  }

  return common.success(returnData)
}

async function addAct(req: Request) {
  let user = req.user,
    doc = common.docValidate(req)

  if (!user.default_organization) {
    return common.error('org_02')
  }
  if (!_.isEmpty(doc.user_id)) {
    let orguser = await common_organization_user.findOne({
      organization_id: user.default_organization,
      user_id: doc.user_id,
    })
    if (!orguser) {
      await common_organization_user.update(
        {
          organization_user_default_flag: '0',
        },
        {
          user_id: doc.user_id,
        }
      )

      await common_organization_user.create({
        organization_id: user.default_organization,
        user_id: doc.user_id,
        organization_user_default_flag: '1',
      })
    }
  }
  return common.success()
}

async function modifyAct(req: Request) {
  let user = req.user,
    doc = common.docValidate(req)

  if (!user.default_organization) {
    return common.error('org_02')
  }

  let orguser = await common_organization_user.findOne({
    organization_id: user.default_organization,
    user_id: doc.user_id,
  })

  if (orguser) {
    let modiuser = await common_user.findOne({
      user_id: doc.user_id,
      state: GLBConfig.ENABLE,
    })
    if (modiuser) {
      if (doc.user_email) {
        let emailuser = await common_user.findOne({
          user_id: Not(modiuser.user_id),
          user_email: doc.user_email,
        })
        if (emailuser) {
          return common.error('operator_02')
        }
      }

      if (doc.user_phone) {
        let phoneuser = await common_user.findOne({
          where: {
            user_id: Not(modiuser.user_id),
            user_phone: doc.user_phone,
          },
        })
        if (phoneuser) {
          return common.error('operator_02')
        }
      }

      modiuser.user_email = doc.user_email
      modiuser.user_phone = doc.user_phone
      modiuser.user_name = doc.user_name
      await modiuser.save()

      let domaingroups = await common_usergroup.find({
          organization_id: user.default_organization,
          node_type: '01',
      })

      let ids = []
      for (let g of domaingroups) {
        ids.push(g.usergroup_id)
      }

      await common_user_groups.delete({
          user_id: modiuser.user_id,
          usergroup_id: In(ids)
      })

      for (let gid of doc.user_groups) {
        await common_user_groups.create({
          user_id: modiuser.user_id,
          usergroup_id: gid,
        })
      }

      logger.debug('modify success')
      return common.success()
    } else {
      return common.error('operator_03')
    }
  } else {
    return common.error('org_03')
  }
}

async function deleteAct(req: Request) {
  let user = req.user,
    doc = common.docValidate(req)

  if (!user.default_organization) {
    return common.error('org_02')
  }

  let orguser = await common_organization_user.findOne({
      organization_id: user.default_organization,
      user_id: doc.user_id,
  })

  if (orguser) {
    if (orguser.organization_user_default_flag === '1') {
      await orguser.remove()
      let dforguser = await common_organization_user.findOne({
          user_id: doc.user_id,
      })
      if (dforguser) {
        dforguser.organization_user_default_flag = '1'
        await dforguser.save()
      }
    } else {
      await orguser.remove()
    }
  }

  return common.success()
}

export default {
  initAct,
  searchAct,
  addAct,
  modifyAct,
  deleteAct
}
