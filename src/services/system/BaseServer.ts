import { Request } from 'express'
import _ from 'lodash'
import { simpleSelect } from '@app/db'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { common_user, common_usergroup, common_user_groups, common_user_wechat } from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function searchUserAct(req: Request) {
  let doc = await common.docValidate(req),
  returnData = Object.create(null)

  if (Number(doc.search_text) + '' === doc.search_text) {
    if (doc.search_text.length < 9) {
      return common.error('base_01')
    }
  } else {
    if (doc.search_text.length < 2) {
      return common.error('base_01')
    }
  }

  let queryStr = `SELECT
      a.user_id,
      a.user_email,
      a.user_phone,
      a.user_name,
      a.user_avatar,
      b.user_wechat_nickname,
      b.user_wechat_headimgurl 
    FROM
      tbl_common_user a
      LEFT JOIN tbl_common_user_wechat b ON a.user_id = b.user_id 
    WHERE
      a.state = "1" 
      AND user_type = "00"`
  let replacements = []

  if (doc.search_text) {
    queryStr += ' AND( user_email LIKE ? OR user_phone LIKE ? OR user_name LIKE ?)'
    let search_text = doc.search_text + '%'
    replacements.push(search_text)
    replacements.push(search_text)
    replacements.push(search_text)
  }

  queryStr += ' LIMIT 10'

  let result = await simpleSelect(queryStr, replacements)

  let uni = _.sortedUniqBy<any>(result, 'user_id')
  returnData.rows = []

  for (let r of uni) {
    returnData.rows.push({
      user_id: r.user_id,
      user_email: r.user_email,
      user_phone: r.user_phone.substring(0, 3) + '******' + r.user_phone.substring(r.user_phone.length - 3),
      user_name: r.user_name,
      user_avatar: r.user_avatar,
      nickname: r.user_wechat_nickname,
      headimgurl: r.user_wechat_headimgurl
    })
  }

  return common.success(returnData)
}

export default {
  searchUserAct,
}
