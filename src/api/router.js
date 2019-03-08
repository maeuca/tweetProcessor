import express from 'express'
import debug from 'debug'
import config from 'config'
import getStore from './store'

const dbg = debug('app:twitter:router')
const router = express.Router()
const options = {
  twitter: config.get('search.twitter')
}

const store = getStore({options})

router.get('/tweets/report', async (req, res, next) => {
  try {
    const report = store.report({})
    dbg('router.report=%o', report)
    res.json(report)
  } catch (err) {
    next(err)
  }
})
export default router
