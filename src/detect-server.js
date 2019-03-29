const gatsbyDetector = require('./detectors/gatsby')
const reactStaticDetector = require('./detectors/react-static')
const craDetector = require('./detectors/cra')
const hugoDetector = require('./detectors/hugo')
const eleventyDetector = require('./detectors/eleventy')
const jekyllDetector = require('./detectors/jekyll')
const vueDetector = require('./detectors/vue')

const detectors = [
  gatsbyDetector,
  reactStaticDetector,
  hugoDetector,
  jekyllDetector,
  eleventyDetector,
  craDetector,
  vueDetector
]

module.exports.serverSettings = devConfig => {
  let settings = null
  for (const i in detectors) {
    settings = detectors[i]()
    if (settings) {
      break
    }
  }

  if (devConfig) {
    settings = settings || {}
    if (devConfig.cmd) {
      settings.cmd = devConfig.cmd.split(/\s/)[0]
      settings.args = devConfig.cmd.split(/\s/).slice(1)
    }
    if (devConfig.port) {
      settings.proxyPort = devConfig.port
      settings.urlRegexp = devConfig.urlRegexp || new RegExp(`(http://)([^:]+:)${devConfig.port}(/)?`, 'g')
    }
    settings.dist = devConfig.publish || settings.dist
  }

  return settings
}
