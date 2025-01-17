let estimo = require('estimo')

let { saveCache, getCache } = require('./cache')

const EXAMPLE = require.resolve('react/umd/react.production.min.js')
const EXAMPLE_TIME = 0.086 // Xiaomi Redmi 2, Snapdragon 410
const URL = 'https://discuss.circleci.com/t/puppeteer-fails-on-circleci/22650'

async function getTime (file, throttling = 1) {
  let value = 0
  for (let i = 0; i < 3; i++) {
    let perf
    try {
      perf = await estimo(file)
    } catch (e) {
      if (process.env.CIRCLECI) {
        console.warn(
          `Check that you use circleci/node:latest-browsers Docker image.\n` +
          `More details: ${ URL }\n`
        )
      }
      throw e
    }
    value += perf[0].javaScript / 1000
  }
  return throttling * value / 3
}

async function getThrottling () {
  let cache = await getCache()
  if (cache !== false) {
    return cache
  } else {
    let time = await getTime(EXAMPLE)
    let throttling = Math.round(EXAMPLE_TIME / time)
    await saveCache(throttling)
    return throttling
  }
}

module.exports = async function getRunningTime (file) {
  return getTime(file, await getThrottling())
}
