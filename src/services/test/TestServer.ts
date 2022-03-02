import { Request } from 'express'
import { createLogger } from '@app/logger'
import common from '@util/Common'
const logger = createLogger(__filename)

async function searchAct (req: Request) {
  const user = req.user
  logger.info(user)
  logger.debug('search')
  return common.success({ aaaa: 1111 })
}

export default {
  searchAct
}
