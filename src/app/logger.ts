import log4js, { Configuration } from 'log4js'
import config from 'config'

export function createLogger(name: string) {
  const logConfig = config.get('loggerConfig') as Configuration
  log4js.configure(logConfig)
  let logger = log4js.getLogger(name)
  return logger
}
