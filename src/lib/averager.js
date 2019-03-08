const avgPersec = []
const avgPermin = []
const avgPerhour = []

let ndxPerSec = 0
let ndxPerMin = 0
let ndxPerHour = 0
/**
 * Maintains a rolling average of values starting at 1 second intervals
 * @param value
 */
export function updateAvg(value) {
  if (ndxPerSec > 60) {
    ndxPerSec = 0
    avgPermin[ndxPerMin] = getAvg(avgPersec) * 60
    ndxPerMin++
  }
  if (ndxPerMin > 60) {
    ndxPerMin = 0
    avgPerhour[ndxPerHour] = getAvg(avgPermin) * 60
    ndxPerHour++
  }
  if (ndxPerHour > 24) {
    ndxPerHour = 0
  }
  avgPersec[ndxPerSec] = value
  ndxPerSec++
}

export function getPerSec() {
  return getAvg(avgPersec)
}

export function getPerMin() {
  if (avgPermin.length === 0) {
    return 0
  }
  return getAvg(avgPermin)
}

export function getPerHour() {
  if (avgPerhour.length === 0) {
    return 0
  }
  return getAvg(avgPerhour)
}

function getAvg(arr) {
  return arr.reduce((p, c) => {
    return p + c
  }) / arr.length
}
