const gatsbyDetector = require('./detectors/gatsby')
const reactStaticDetector = require('./detectors/react-static')
const craDetector = require('./detectors/cra')
const hugoDetector = require('./detectors/hugo')
const eleventyDetector = require('./detectors/eleventy')
const jekyllDetector = require('./detectors/jekyll')

const detectors = [gatsbyDetector, reactStaticDetector, hugoDetector, jekyllDetector, eleventyDetector, craDetector]

module.exports.serverSettings = () => {
  for (const i in detectors) {
    const settings = detectors[i]()
    if (settings) {
      return settings
    }
  }

  return null
}
