import log4js from 'log4js'
import express, { Request, Response } from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from 'config'
import { authority, SecureConfig } from 'node-srv-utils'
import { simpleSelect } from '@app/db'
import routers from '@/routes'
const app = express()
app.use(cors())

app.use(express.static(path.join(__dirname, '../public')))
app.use('/temp', express.static(path.join(__dirname, '../../public/temp')))
app.use('/files', express.static(path.join(__dirname, '../../public/files')))
app.use(
  log4js.connectLogger(log4js.getLogger('http'), {
    level: 'auto',
    nolog: '\\.gif|\\.jpg$',
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.raw())
app.use(cookieParser())

const secureConfig = config.get<SecureConfig>('security')
authority.initMiddleware(simpleSelect, secureConfig)
// app.use('/api', authority.AuthMiddleware, systemTrace)
app.use('/api', authority.authMiddleware)

// 处理webpack服务请求
app.get('/__webpack_hmr', function (req: Request, res: Response) {
  res.send('')
})

for (let r of routers) {
  app.use(r.url, r.handler)
}

export default app
