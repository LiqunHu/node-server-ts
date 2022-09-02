import { Request } from 'express'
import _ from 'lodash'
import { authority } from 'node-srv-utils'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { common_user } from '@entities/common'
import AuthServer from '@services/auth/AuthServer'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function genSystemTokenAct(req: Request) {
  let doc = common.docValidate(req)

  let user = await common_user.findOneBy({
    user_id: doc.user_id,
    user_type: GLBConfig.USER_TYPE.TYPE_SYSTEM,
  })
  if (!user) {
    return common.error('auth_01')
  }
  let session_token = authority.user2token('SYSTEM', user.user_id)
  let loginData = await AuthServer.loginInit(user, session_token, 'SYSTEM')
  if (loginData) {
    loginData.Authorization = session_token
    return common.success({
      login: true,
      data: loginData,
    })
  } else {
    return common.error('auth_03')
  }
}

export default {
  genSystemTokenAct,
}
