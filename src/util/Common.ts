import fs from 'fs'
import Joi from 'joi'
import _ from 'lodash'
import { Request } from 'express'
import { createLogger } from '@app/logger'
import Error from './Error'

const logger = createLogger(__filename)

function docValidate(req: Request) {
  const doc = req.body
  return doc
}

async function reqTrans(req: Request, callFile: string) {
  const method = req.params.method
  const doc = req.body
  const validatorFile =
    callFile.substring(0, callFile.length - 3) +
    '.validator' +
    callFile.substring(callFile.length - 3, callFile.length)
  if (fs.existsSync(validatorFile)) {
    const validator = await import(validatorFile)
    if (validator.default.apiList.hasOwnProperty(method)) {
      const reqJoiSchema = validator.default.apiList[method].JoiSchema
      if (reqJoiSchema.body) {
        const schema = Joi.object(reqJoiSchema.body)
        await schema.validateAsync(doc)
      }
    }
  }

  return method
}

// common response
function success(data?: any) {
  if (data) {
    return data
  } else {
    return {}
  }
}

function error(errcode?: string) {
  if (_.isString(errcode)) {
    return errcode
  } else {
    return 'common_02'
  }
}

function sendData(res: any, data: any) {
  if (_.isString(data)) {
    if ('WebSocket' in res || 'rabbitmq' in res) {
      res.errno = data
      if (data in Error) {
        res.msg = Error[data]
      } else {
        res.msg = '错误未配置'
      }
    } else {
      let sendData
      if (data in Error) {
        sendData = {
          errno: data,
          msg: Error[data],
        }
      } else {
        sendData = {
          errno: data,
          msg: '错误未配置',
        }
      }
      res.status(700).send(sendData)
    }
  } else {
    if ('WebSocket' in res || 'rabbitmq' in res) {
      res.info = data
    } else {
      res.send({
        errno: '0',
        msg: 'ok',
        info: data,
      })
    }
  }
}

function sendFault(res: any, msg: any) {
  let sendData = {}
  logger.error(msg.stack)

  if ('WebSocket' in res || 'rabbitmq' in res) {
    res.errno = -1
    res.msg = msg.stack
  } else {
    if (process.env.NODE_ENV === 'test') {
      sendData = {
        errno: -1,
        msg: msg.stack,
      }
    } else {
      sendData = {
        errno: -1,
        msg: 'Internal Error',
      }
    }
    res.status(500).send(sendData)
  }
}
function generateRandomAlphaNum(len: number) {
  const charSet = '0123456789'
  let randomString = ''
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length)
    randomString += charSet.substring(randomPoz, randomPoz + 1)
  }
  return randomString
}

function generateNonceString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const maxPos = chars.length
  let noceStr = ''
  for (let i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return noceStr
}

// const getUploadTempPath = uploadurl => {
//   let fileName = path.basename(uploadurl)
//   return path.join(__dirname, '../' + config.uploadOptions.uploadDir + '/' + fileName)
// }

// const fileSave = async (req, bucket) => {
//   if (config.fileSys.type === 'local') {
//     let relPath = 'upload/' + moment().format('YYYY/MM/DD/')
//     let svPath = path.join(process.cwd(), config.fileSys.filesDir, relPath)
//     let fileInfo = await fileUtil.fileSaveLocal(req, svPath, config.fileSys.urlBaseu + relPath)
//     return fileInfo
//   } else if (config.fileSys.type === 'qiniu') {
//     if (config.fileSys.bucket[bucket]) {
//       let tempDir = path.join(process.cwd(), config.fileSys.filesDir)
//       let fileInfo = await fileUtil.fileSaveQiniu(req, tempDir, bucket, config.fileSys.bucket[bucket].domain)
//       return fileInfo
//     } else {
//       throw ('bucket do not exist')
//     }
//   } else if (config.fileSys.type === 'mongo') {
//     if (config.fileSys.bucket[bucket]) {
//       let tempDir = path.join(process.cwd(), config.fileSys.filesDir)
//       let fileInfo = await fileUtil.fileSaveMongo(req, tempDir, bucket, config.fileSys.bucket[bucket].baseUrl)
//       return fileInfo
//     } else {
//       throw ('bucket do not exist')
//     }
//   } else if (config.fileSys.type === 'qiniuweb') {
//     if (config.fileSys.bucket[bucket]) {
//       return {
//         action: config.fileSys.bucket[bucket].action,
//         domain: config.fileSys.bucket[bucket].domain,
//         token: fileUtil.FileSaveQiniuToken(bucket)
//       }
//     } else {
//       throw ('bucket do not exist')
//     }
//   }
// }

export default {
  docValidate,
  reqTrans,
  success,
  error,
  sendData,
  sendFault,
  generateRandomAlphaNum,
  generateNonceString,
}
