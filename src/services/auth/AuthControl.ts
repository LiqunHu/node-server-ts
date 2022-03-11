import { Request, Response } from 'express'
import common from '@util/Common'
import srv from './AuthServer'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

export default async function (req: Request, res: Response) {
  try {
    const method = await common.reqTrans(req, __filename)
    let ret = 'common_01'
    logger.debug(method)

    if (method === 'signin') {
      ret = await srv.signinAct(req)
    } else if (method === 'captcha') {
      ret = await srv.captchaAct()
    } else if (method === 'loginSms') {
      ret = await srv.loginSmsAct(req)
    } else if (method === 'signinBySms') {
      ret = await srv.signinBySmsAct(req)
    } else if (method === 'signout') {
      ret = await srv.signoutAct(req)
    }

    common.sendData(res, ret)
  } catch (error) {
    common.sendFault(res, error)
  }
}
