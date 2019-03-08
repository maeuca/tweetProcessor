import config from 'config'
import start from '.'

export default (async function () {
  start(config.get('service.port'))
})()
