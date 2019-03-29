const { existsSync, readFileSync } = require('fs')

module.exports = function() {
  if (!existsSync('package.json')) {
    return false
  }

  const packageSettings = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }))
  const { dependencies, scripts } = packageSettings
  if (!(dependencies && dependencies.vuepress)) {
    return false
  }

  const yarnExists = existsSync('yarn.lock')
  return {
    cmd: 'vuepress',
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    args: ['dev'],
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: '.vuepress/dist'
  }
}
