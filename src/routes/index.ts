import test from './test'
import auth from './auth'

export default [
  { url: '/api/auth', handler: auth },
  { url: '/api/test', handler: test },
]
