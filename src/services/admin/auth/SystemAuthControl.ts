import { Request, Response } from 'express'
import common from '@util/Common'
import srv from './SystemAuthServer'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

export default async function (req: Request, res: Response) {
  try {
    let method = await common.reqTrans(req, __filename)
    let ret = 'common_01'
    logger.debug(method)
    if (method === 'genSystemToken') {
      ret = await srv.genSystemTokenAct(req)
    } 

    common.sendData(res, ret)
  } catch (error) {
    common.sendFault(res, error)
  }
}
