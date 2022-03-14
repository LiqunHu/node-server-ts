import admin from './admin'
import auth from './auth'
import test from './test'

export default [
  { url: '/api/node/auth', handler: auth },
  { url: '/api/node/admin', handler: admin },
  { url: '/api/test', handler: test },
]
