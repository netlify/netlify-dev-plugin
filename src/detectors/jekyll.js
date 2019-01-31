const { existsSync } = require('fs')

module.exports = function() {
  if (!existsSync('_config.yml')) {
    return false
  }

  const settings = {
    port: 8888,
    proxyPort: 4000,
    env: { ...process.env },
    cmd: 'bundle',
    args: ['exec', 'jekyll', 'serve', '-w', '-l'],
    urlRegexp: new RegExp(`(http://)([^:]+:)${4000}(/)?`, 'g'),
    dist: '_site'
  }

  return settings
}
