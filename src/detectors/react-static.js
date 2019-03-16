const { existsSync } = require('fs')

module.exports = function() {
  if (!existsSync('static.config.js')) {
    return false
  }

  const yarnExists = existsSync('yarn.lock')
  return {
    cmd: yarnExists ? 'yarn' : 'npm',
    port: 8888,
    proxyPort: 3000,
    env: { ...process.env },
    args: yarnExists ? ['run', 'start'] : ['start'],
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, 'g'),
    dist: 'dist'
  }
}
