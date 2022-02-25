import log4js from 'log4js'
import express, { Request, Response } from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import { createLogger } from './logger'
const logger = createLogger(__filename)
const app = express()
app.use(cors())

app.use(express.static(path.join(__dirname, '../public')))
app.use('/temp', express.static(path.join(__dirname, '../../public/temp')))
app.use('/files', express.static(path.join(__dirname, '../../public/files')))
app.use(
  log4js.connectLogger(log4js.getLogger('http'), {
    level: 'auto',
    nolog: '\\.gif|\\.jpg$'
  })
)
app.use(
  bodyParser.json({
    limit: '50mb'
  })
)
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)
app.use(
  bodyParser.text({
    type: 'text/*'
  })
)
app.use(bodyParser.raw())
app.use(cookieParser())

// 处理webpack服务请求
app.get('/__webpack_hmr', function (req: Request, res: Response) {
  res.send('')
})

app.get('/', (req: Request, res: Response) => {
  logger.debug('11111111111')
  res.send('Wellcome, My name is Hung.')
})

export default app
