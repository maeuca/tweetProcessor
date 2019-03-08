import express from 'express'
import debug from 'debug'
import bodyParser from 'body-parser'
import correlator from 'express-correlation-id'
import helmet from 'helmet'
import cors from 'cors'
import {errorHandler, logger} from './lib/rest-utils'
import twitterRouter from './api/router'
import {startStream} from './lib/processor'

export default async function (port) {
  const dbg = debug('app:twitter')
  const app = express()

  app.use(correlator())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(helmet())
  app.use(cors())

  app.get('/', (req, res) => {
    res.send('...twitter home...')
  })
  app.use(logger({dbgreq: dbg, debug: true}))
  app.use('/twitter', twitterRouter)
  app.use(errorHandler({dbgreq: dbg, debug: true}))

  await app.listen(port)
  startStream()
  dbg('listening on port=%o', port)
}
