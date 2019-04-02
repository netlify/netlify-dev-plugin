const { existsSync } = require('fs')

module.exports = function() {
  if (!existsSync('.eleventy.js')) {
    return false
  }

  return {
    type: 'eleventy',
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    command: 'npx',
    args: ['eleventy', '--serve', '--watch'],
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: '_site'
  }
}
