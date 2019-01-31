const { existsSync } = require('fs')

module.exports = function() {
  if (!existsSync('gatsby-config.js')) {
    return false
  }

  const settings = {
    port: 8888,
    proxyPort: 8000,
    env: { ...process.env },
    args: [],
    urlRegexp: new RegExp(`(http://)([^:]+:)${8000}(/)?`, 'g'),
    dist: 'public'
  }

  if (existsSync('yarn.lock')) {
    settings.cmd = 'yarn'
  } else {
    settings.cmd = 'npm'
    settings.args.push('run')
  }
  settings.args.push('dev')

  return settings
}
