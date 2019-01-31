const { existsSync } = require('fs')

module.exports = function() {
  if (!existsSync('static.config.js')) {
    return false
  }

  const settings = {
    port: 8888,
    proxyPort: 3000,
    env: { ...process.env },
    args: [],
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, 'g'),
    dist: 'dist'
  }

  if (existsSync('yarn.lock')) {
    settings.cmd = 'yarn'
  } else {
    settings.cmd = 'npm'
    settings.args.push('run')
  }
  settings.args.push('start')

  return settings
}
