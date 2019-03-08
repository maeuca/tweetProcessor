import debug from 'debug'
import config from 'config'
import _ from 'lodash'
import Twit from 'twit'
import getStore from '../api/store'
import {updateAvg, getPerSec, getPerMin, getPerHour} from './averager'

const dbg = debug('app:twitter:processor')
const store = getStore({})

/* eslint camelcase: ["error", {properties: "never"}] */
const options = {
  consumer_key: config.get('twitter.consumer_key'),
  consumer_secret: config.get('twitter.consumer_secret'),
  access_token: config.get('twitter.access_token'),
  access_token_secret: config.get('twitter.access_token_secret'),
  timeout_ms: config.get('twitter.timeout_ms'),
  strictSSL: config.get('twitter.strictSSL')
}

const emojiRegex = new RegExp(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/)
let totals = {}

function reset() {
  totals = {
    last_received: 0,
    received: 0,
    perMin: 0,
    perSec: 0,
    perHour: 0,
    emojiCounter: 0,
    percEmoji: 0,
    urlCounter: 0,
    percUrls: 0,
    photoUrls: 0,
    percPhoto: 0,
    hashTags: {},
    urls: {},
    emojis: {},
    topHashTags: [],
    topDomains: [],
    topEmojis: []
  }
  store.reset({})
}

function sumHashTags(hashtags) {
  for (let i = 0; i < hashtags.length; i++) {
    const count = totals.hashTags[hashtags[i].text] ? totals.hashTags[hashtags[i].text] + 1 : 1
    totals.hashTags[hashtags[i].text] = count
  }
}

function getTopList(objList) {
  const top = 3
  let ndx = 1
  const sorted = _(objList)
    .toPairs()
    .orderBy([1], ['desc'])
    .fromPairs()
    .value()
  const topList = []

  /* eslint guard-for-in: "off" */
  for (const obj in sorted) {
    if (ndx > top) {
      break
    }
    topList.push(obj)
    ndx++
  }

  return topList
}

function searchEmojis(text) {
  const words = _.toArray(text)
  let hasEmoji = false
  for (const ndx in words) {
    if (emojiRegex.test(words[ndx])) {
      // dbg('emoji=%o', words[ndx])
      hasEmoji = true
      const count = totals.emojis[words[ndx]] ? totals.emojis[words[ndx]] + 1 : 1
      totals.emojis[words[ndx]] = count
    }
  }
  return hasEmoji
}

/* eslint camelcase: ["error", {properties: "never"}] */
function searchUrls(urls) {
  let hasPhoto = false
  for (let i = 0; i < urls.length; i++) {
    hasPhoto = (urls[i].display_url.includes('instagram') || urls[i].display_url.includes('pic.twitter.com'))
    if (hasPhoto) {
      break
    }
  }
  for (let i = 0; i < urls.length; i++) {
    const domain = urls[i].expanded_url.split('/')[2]
    const count = totals.urls[domain] ? totals.urls[domain] + 1 : 1
    totals.urls[domain] = count
  }
  return hasPhoto
}

function processTweet(tweet) {
  sumHashTags(tweet.entities.hashtags)
  const hasPhoto = searchUrls(tweet.entities.urls)
  const hasEmoji = searchEmojis(tweet.text)
  if (totals.received > 1000000) {
    reset()
  }
  totals.photoUrls = hasPhoto ? totals.photoUrls + 1 : totals.photoUrls
  totals.emojiCounter = hasEmoji ? totals.emojiCounter + 1 : totals.emojiCounter
  totals.urlCounter = (tweet.entities.urls.length > 0) ? totals.urlCounter + 1 : totals.urlCounter

  totals.received += 1
}

/* eslint camelcase: ["error", {properties: "never"}] */
function calcRates() {
  setInterval(() => {
    updateAvg(totals.received - totals.last_received)
    totals.perSec = getPerSec().toFixed(2)
    totals.perMin = getPerMin().toFixed(2)
    totals.perHour = getPerHour().toFixed(2)
    totals.last_received = totals.received
    totals.percUrls = ((totals.urlCounter / totals.received) * 100).toFixed(2)
    totals.percPhoto = ((totals.photoUrls / totals.received) * 100).toFixed(2)
    totals.percEmoji = ((totals.emojiCounter / totals.received) * 100).toFixed(2)
    // dbg('calcRates=%o', totals)
    totals.topHashTags = getTopList(totals.hashTags)
    totals.topDomains = getTopList(totals.urls)
    totals.topEmojis = getTopList(totals.emojis)
    const _data = _.pick(totals, ['received', 'perSec', 'perMin', 'perHour', 'topEmojis', 'percEmoji', 'topHashTags', 'percUrls', 'percPhoto', 'topDomains'])
    // dbg('topDomains=%o topHashTags=%o topEmojis=%o, percUrls=%d, percPhoto=%d percEmoji=%d', totals.topDomains, totals.topHashTags, totals.topEmojis, totals.percUrls, totals.percPhoto, totals.percEmoji)
    store.update({data: _data})
    totals.last_received = (totals.received > 100000000) ? 0 : totals.received
  }, 1000)
}

export function startStream() {
  dbg('processor starting up...')
  reset()
  calcRates()
  const T = new Twit(options)
  const stream = T.stream('statuses/sample')

  stream.on('tweet', tweet => {
    processTweet(tweet)
  })
}

(async function () {
  startStream()
})()
