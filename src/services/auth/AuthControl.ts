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
    } else if (method === 'signinBySms') {
      ret = await srv.signinBySmsAct(req)
    } else if (method === 'signinByWx') {
      ret = await srv.signinByWxAct(req)
    } else if (method === 'signout') {
      ret = await srv.signoutAct(req)
    } else if (method === 'loginSms') {
      ret = await srv.loginSmsAct(req)
    } else if (method === 'captcha') {
      ret = await srv.captchaAct(req)
    } else if (method === 'registerSms') {
      ret = await srv.registerSmsAct(req)
    } else if (method === 'registerByPhone') {
      ret = await srv.registerByPhoneAct(req)
    } else if (method === 'registerByWx') {
      ret = await srv.registerByWxAct(req)
    } else if (method === 'registerDevice') {
      ret = await srv.registerDeviceAct(req)
    } else if (method === 'signinDevice') {
      ret = await srv.signinDeviceAct(req)
    }

    common.sendData(res, ret)
  } catch (error) {
    common.sendFault(res, error)
  }
}
