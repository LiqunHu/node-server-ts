import { Request, Response } from 'express'
import common from '@util/Common'
import srv from './SystemApiServer'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

export default async function (req: Request, res: Response) {
  try {
    let method = await common.reqTrans(req, __filename)
    let ret = 'common_01'
    logger.debug(method)
    if (method === 'init') {
      ret = await srv.initAct()
    } else if (method === 'search') {
      ret = await srv.searchAct()
    } else if (method === 'addFolder') {
      ret = await srv.addFolderAct(req)
    } else if (method === 'modifyFolder') {
      ret = await srv.modifyFolderAct(req)
    } else if (method === 'addMenu') {
      ret = await srv.addMenuAct(req)
    } else if (method === 'modifyMenu') {
      ret = await srv.modifyMenuAct(req)
    } else if (method === 'remove') {
      ret = await srv.removeAct(req)
    }
    common.sendData(res, ret)
  } catch (error) {
    common.sendFault(res, error)
  }
}
