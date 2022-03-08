import { getManager, createConnection } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import config from 'config'

let table = 'src/entities/common/CommonUsergroup.ts'
// let connection: Connection | null = null
export async function createDB() {
  if (table) {
    await createConnection({
      type: 'mysql',
      host: config.get<string>('mysql.host'),
      port: config.get<number>('mysql.port'),
      username: config.get<string>('mysql.username'),
      password: config.get<string>('mysql.password'),
      database: config.get<string>('mysql.database'),
      entities: [table],
      synchronize: true,
      logging: config.get<boolean>('mysql.logging'),
      namingStrategy: new SnakeNamingStrategy(),
    })
  }
}

;(async () => {
  await createDB()
  process.exit(0)
})()
