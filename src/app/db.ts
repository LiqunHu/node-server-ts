import {
  getManager,
  createConnection,
  Logger,
  LoggerOptions,
  QueryRunner,
} from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import config from 'config'
import { createLogger } from '@app/logger'
const logger = createLogger(__filename)

// let connection: Connection | null = null

export async function initDB() {
  await createConnection({
    type: 'mysql',
    host: config.get<string>('mysql.host'),
    port: config.get<number>('mysql.port'),
    username: config.get<string>('mysql.username'),
    password: config.get<string>('mysql.password'),
    database: config.get<string>('mysql.database'),
    entities: ['src/entities/**/*.ts'],
    synchronize: false,
    logging:true,
    logger: new Log4jsLogger(),
    namingStrategy: new SnakeNamingStrategy(),
  })
}

export async function simpleSelect(queryStr: string, replacements?: any[]) {
  const entityManager = getManager()
  const result = await entityManager.query(queryStr, replacements)
  return result
}

// export async function queryWithCount () => {

// }
// module.exports.queryWithCount = async (pageDoc, queryStr, replacements) => {
//   let queryStrCnt = ''
//   let lowerStr = queryStr.toLowerCase()
//   if (lowerStr.indexOf('group by') >= 0) {
//     queryStrCnt = 'select count(1) num from ( ' + lowerStr + ' ) temp'
//   } else {
//     let cnt = lowerStr.indexOf('from') + 5
//     queryStrCnt = 'select count(1) num from ' + queryStr.substr(cnt)
//   }

//   let count = await dbHandle.query(queryStrCnt, {
//     replacements: replacements,
//     type: dbHandle.QueryTypes.SELECT
//   })

//   let rep = replacements
//   rep.push(pageDoc.offset || 0)
//   rep.push(pageDoc.limit || 100)

//   let queryRst = await dbHandle.query(queryStr + ' LIMIT ?,?', {
//     replacements: rep,
//     type: dbHandle.QueryTypes.SELECT
//   })

//   return {
//     count: count[0].num,
//     data: queryRst
//   }
// }

class Log4jsLogger implements Logger {
  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '')
    logger.info('query' + ': ' + sql)
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '')
    logger.error(`query failed: ` + sql)
    logger.error(`error:`, error)
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '')
    logger.warn(`query is slow: ` + sql)
    logger.warn(`execution time: ` + time)
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    logger.trace(message)
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner) {
    logger.info(message)
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        logger.debug(message)
        break
      case 'info':
        logger.info(message)
        break
      case 'warn':
        logger.warn(message)
        break
    }
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  /**
   * Converts parameters to a string.
   * Sometimes parameters can have circular objects and therefor we are handle this case too.
   */
  protected stringifyParams(parameters: any[]) {
    try {
      return JSON.stringify(parameters)
    } catch (error) {
      // most probably circular objects in parameters
      return parameters
    }
  }
}
