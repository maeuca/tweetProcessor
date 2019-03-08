import cuid from 'cuid'

export function errorHandler(options = {debug: true, dbgreq: null}) {
  return async (err, req, res, next) => {
    const logid = cuid.slug()
    options.dbgreq('id:%s default error handler: err:%s', logid, err)

    if (err) {
      res.status('400')
      res.send(
        {
          name: err.name,
          message: err.message,
          id: logid
        }
      )
    } else {
      next()
    }
  }
}

export function logger(options = {debug: true, dbgreq: null}) {
  return async (req, res, next) => {
    const d = new Date()
    const dformat = [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':')
    options.dbgreq(
      '%s[%s]%s: params=%o, query=%o, body=%o, user=%o, correlationId=%o',
      dformat, req.method, req.path, req.params, req.query, req.correlationId()
    )
    next()
  }
}
