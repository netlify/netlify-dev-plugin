const path = require('path')
const detectors = require('fs')
  .readdirSync(path.join(__dirname, 'detectors'))
  .filter(x => x.endsWith('.js')) // only accept .js detector files
  .map(det => require(path.join(__dirname, `detectors/${det}`)))

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
    if (devConfig.command) {
      assignLoudly(settings, 'command', devConfig.command.split(/\s/)[0])
      assignLoudly(settings, 'args', devConfig.command.split(/\s/).slice(1))
    }
    if (devConfig.port) {
      assignLoudly(settings, 'proxyPort', devConfig['port'])
      assignLoudly(
        settings,
        'urlRegexp',
        devConfig.urlRegexp || new RegExp(`(http://)([^:]+:)${devConfig.port}(/)?`, 'g')
      )
    }
    assignLoudly(settings, 'dist', devConfig['publish'])
  }

  return settings
}

// mutates the settings field, but tell the user if it does
function assignLoudly(settings, settingsField, newValue) {
  if (settings[settingsField] !== newValue) {
    // silent if command is exactly same
    console.log(`Overriding ${settingsField} with setting derived from netlify.toml [dev] block: `, newValue)
    settings[settingsField] === newValue
  }
}
