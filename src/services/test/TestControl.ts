import { Request, Response } from 'express'
import common from '@util/Common'
import srv from './TestServer'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

export default async function (req: Request, res: Response) {
  try {
    const method = await common.reqTrans(req, __filename)
    let ret = 'common_01'
    logger.debug(method)

    if (method === 'search') {
      ret = await srv.searchAct(req)
    }

    common.sendData(res, ret)
  } catch (error) {
    common.sendFault(res, error)
  }
}
