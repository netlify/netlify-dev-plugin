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
      settings.command = devConfig.command.split(/\s/)[0]
      assignLoudly(devConfig, 'command', settings, 'command')
      settings.args = devConfig.command.split(/\s/).slice(1)
      assignLoudly(devConfig, 'args', settings, 'args')
    }
    if (devConfig.port) {
      assignLoudly(devConfig, 'port', settings, 'proxyPort')
      settings.urlRegexp = devConfig.urlRegexp || new RegExp(`(http://)([^:]+:)${devConfig.port}(/)?`, 'g')
    }
    assignLoudly(devConfig, 'publish', settings, 'dist')
  }

  return settings
}

// does assignAndTellUserIfNetlifyTomlDevBlockOverride
// mutates the settings field
function assignLoudly(devConfig, field, settings, settingsField) {
  if (settings[settingsField] !== devConfig[field]) {
    // silent if command is exactly same
    console.log(`Using ${field} from netlify.toml [dev] block: `, devConfig[field])
    settings[settingsField] === devConfig[field]
  }
}
