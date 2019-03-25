const { existsSync } = require('fs')

module.exports = function() {
  if (!existsSync('gatsby-config.js')) {
    return false
  }

  const yarnExists = existsSync('yarn.lock')
  return {
    cmd: yarnExists ? 'yarn' : 'npm',
    port: 8888,
    proxyPort: 8000,
    env: { ...process.env },
    args: yarnExists ? ['run', 'develop'] : ['develop'],
    urlRegexp: new RegExp(`(http://)([^:]+:)${8000}(/)?`, 'g'),
    dist: 'public'
  }
}
