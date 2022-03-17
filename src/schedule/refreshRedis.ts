import _ from 'lodash'
import { redisClient } from 'node-srv-utils'
import { simpleSelect } from '@app/db'
import GLBConfig from '@util/GLBConfig'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

async function refreshRedis() {
  let apiList = await simpleSelect(
    'select api_function, auth_flag from tbl_common_api where state = "1" and api_function != ""',
    []
  )

  let apis = Object.create(null)
  for (let a of apiList) {
    apis[a.api_function] = a.auth_flag
  }

  if (!_.isEmpty(apis)) {
    await redisClient.set(GLBConfig.REDIS_KEYS.AUTHAPI, apis)
    logger.info('Refresh Api')
  }
}

export default {
  refreshRedis,
}
