import admin from './admin'
import auth from './auth'
import system from './system'
import test from './test'

export default [
  { url: '/api/node/auth', handler: auth },
  { url: '/api/node/admin', handler: admin },
  { url: '/api/node/system', handler: system },
  { url: '/api/test', handler: test },
]
