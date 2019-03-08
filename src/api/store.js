import debug from 'debug'

const dbg = debug('app:twitter:store')

let cache = {}
export default function (opts) {
  function getResetStore({options}) {
    return function ({data = {}}) {
      dbg('getResetStore=%o with %o', data, options)
      cache = {}
    }
  }

  function getUpdateStore({options}) {
    return function ({data = {}}) {
      dbg('getUpdateStore=%o with %o', data, options)
      cache = data
    }
  }

  function getReportData({options}) {
    return function ({data = {}}) {
      dbg('getReportData=%o with %o', data, options)
      return cache
    }
  }

  return {
    reset: getResetStore(opts),
    update: getUpdateStore(opts),
    report: getReportData(opts)
  }
}
