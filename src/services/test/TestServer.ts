import { Request } from 'express'
import { redisClient } from 'server-utils'
import { createLogger } from '@app/logger'
import common from '@util/Common'
import { CommonUser } from '@entities/common/CommonUser'
import { simpleSelect } from '@app/db'
const logger = createLogger(__filename)

async function searchAct(req: Request) {
  const user = req.user
  logger.info(user)
  logger.debug('search')
  const cuser = await CommonUser.findOne({
    userId: '00202780d08011eaa30bdd5d2522ca2c',
  })
  logger.debug(cuser)

  const result = await simpleSelect(
    'select * from tbl_common_user where user_id = ?',
    ['00202780d08011eaa30bdd5d2522ca2c']
  )
  logger.debug(result)

  let ruser = await redisClient.get(
    'AUTH_ADMIN_2e7d5af0606611eb97682d45afbc0ab3'
  )
  logger.debug(ruser)

  return common.success({ aaaa: 1111 })
}

export default {
  searchAct,
}
