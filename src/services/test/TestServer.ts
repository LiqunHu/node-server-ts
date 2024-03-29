import { Request } from 'express'
import { redisClient } from 'node-srv-utils'
import { createLogger } from '@app/logger'
import common from '@util/Common'
import { common_user } from '@/entities/common/common_user'
import { simpleSelect } from '@app/db'
const logger = createLogger(__filename)

async function searchAct(req: Request) {
  const user = req.user
  logger.info(user)
  logger.debug('search')
  const cuser = await common_user.findOneBy({
    user_id: '00b8dcf029eb11ea9e23c9601c77fc6e',
  })
  logger.debug(cuser)
  await common_user.delete({
    user_id: '00b8dcf029eb11ea9e23c9601c77fc6e',
  })

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
