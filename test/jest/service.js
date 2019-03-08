import axios from 'axios'
import config from 'config'

describe('service router with defaults', () => {

  beforeAll(async () => {
    await require('../../src/main')
  })

  afterEach(() => {
    // cleaning up the mess left behind the previous test
  })

  describe('Test the /tweetprocessor path', () => {
    test('GET / response', async () => {
      const response = await axios.get(`http://${config.get('service.host')}:${config.get('service.port')}/`)
      expect(response.status).toBe(200)
    })
  })
})
