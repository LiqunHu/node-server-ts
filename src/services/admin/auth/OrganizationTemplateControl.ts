import { Request, Response } from 'express'
import common from '@util/Common'
import srv from './OrganizationTemplateServer'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

export default async function (req: Request, res: Response) {
  try {
    let method = await common.reqTrans(req, __filename)
    let ret = 'common_01'
    logger.debug(method)
    if (method === 'init') {
      ret = await srv.initAct()
    } else if (method === 'getTemplate') {
      ret = await srv.getTemplateAct(req)
    } else if (method === 'addTemplate') {
      ret = await srv.addTemplateAct(req)
    } else if (method === 'removeTemplate') {
      ret = await srv.removeTemplateAct(req)
    } else if (method === 'getTemplateMenu') {
      ret = await srv.getTemplateMenuAct(req)
    } else if (method === 'addFolder') {
      ret = await srv.addFolderAct(req)
    } else if (method === 'addMenus') {
      ret = await srv.addMenusAct(req)
    } else if (method === 'removeItem') {
      ret = await srv.removeItemAct(req)
    }
    common.sendData(res, ret)
  } catch (error) {
    common.sendFault(res, error)
  }
}
