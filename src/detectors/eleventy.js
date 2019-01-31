const { existsSync } = require('fs')

module.exports = function() {
  if (!existsSync('.eleventy.js')) {
    return false
  }

  const settings = {
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    cmd: 'npx',
    args: ['eleventy', '--serve', '--watch'],
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: '_site'
  }

  return settings
}
