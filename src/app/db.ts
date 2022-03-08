import { getManager, createConnection } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import config from 'config'

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
    logging: config.get<boolean>('mysql.logging'),
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
