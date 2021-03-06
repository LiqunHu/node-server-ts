import log4js, { Configuration } from 'log4js'
import config from 'config'

export function createLogger(name: string) {
  const logConfig = config.get<Configuration>('loggerConfig')
  log4js.configure(logConfig)
  const logger = log4js.getLogger(name)
  return logger
}
