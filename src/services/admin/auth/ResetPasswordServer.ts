import { Not } from 'typeorm'
import { Request } from 'express'
import _ from 'lodash'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { common_user } from '@entities/common'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function searchAct(req: Request) {
  let doc = common.docValidate(req)

  let user = await common_user.findOne({
    where: [
      {
        user_phone: doc.search_text,
        user_type: Not(GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR),
      },
      {
        user_username: doc.search_text,
        user_type: Not(GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR),
      },
      {
        user_email: doc.search_text,
        user_type: Not(GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR),
      },
    ],
  })

  if (user) {
    let ret = JSON.parse(JSON.stringify(user))
    delete ret.user_password
    return common.success(ret)
  } else {
    return common.error('resetpassword_01')
  }
}

async function resetAct(req: Request) {
  let doc = common.docValidate(req)

  let user = await common_user.findOne({
    user_id: doc.user_id,
    updated_at: doc.updated_at,
    version: doc.version,
  })

  if (user) {
    user.user_password = GLBConfig.INITPASSWORD
    user.user_password_error = 0
    await user.save()
    logger.debug('modisuccess')
    return common.success()
  } else {
    return common.error('resetpassword_01')
  }
}

export default {
  searchAct,
  resetAct,
}
