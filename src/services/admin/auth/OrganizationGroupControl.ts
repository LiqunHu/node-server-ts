import { Request, Response } from 'express'
import common from '@util/Common'
import srv from './OrganizationGroupServer'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

export default async function (req: Request, res: Response) {
  try {
    let method = await common.reqTrans(req, __filename)
    let ret = 'common_01'
    logger.debug(method)
    if (method === 'init') {
      ret = await srv.initAct(req)
    } else if (method === 'search') {
      ret = await srv.searchAct(req)
    } else if (method === 'getcheck') {
      ret = await srv.getCheckAct(req)
    } else if (method === 'add') {
      ret = await srv.addAct(req)
    } else if (method === 'modify') {
      ret = await srv.modifyAct(req)
    } else if (method === 'remove') {
      ret = await srv.removeAct(req)
    }
    common.sendData(res, ret)
  } catch (error) {
    common.sendFault(res, error)
  }
}
