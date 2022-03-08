#!/usr/bin/env node
import http from 'http'
import { AddressInfo } from 'net'
import config from 'config'
import { redisClient } from 'server-utils'
import app from './app'
import { initDB } from './app/db'

const port = process.env.PORT || 9090

app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)
/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  const addr = server.address() as AddressInfo
  const bind = 'port ' + addr.port
  console.debug('Listening on ' + bind)
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
  const redisConfig = config.get('redis')
  Promise.all([redisClient.initClient(redisConfig), initDB()]).catch((err) => {
    console.error(err)
  })
  console.info('Init Success')
})
server.on('error', onError)
server.on('listening', onListening)
