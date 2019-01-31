const { existsSync, readFileSync } = require('fs')

module.exports = function() {
  if (!existsSync('package.json')) {
    return false
  }

  const package = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }))
  if (!(package.dependencies && package.dependencies['react-scripts'])) {
    return false
  }

  const settings = {
    port: 8888,
    proxyPort: 3000,
    env: { ...process.env, BROWSER: 'none', PORT: 3000 },
    args: [],
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, 'g'),
    dist: 'dist'
  }

  if (package) {
    if (existsSync('yarn.lock')) {
      settings.cmd = 'yarn'
    } else {
      settings.cmd = 'npm'
      settings.args.push('run')
    }

    if (package.scripts.start) {
      settings.args.push('start')
    } else if (package.scripts.serve) {
      settings.args.push('serve')
    } else if (package.scripts.run) {
      settings.args.push('run')
    } else {
      console.error("Couldn't determine the script to run. Use the -c flag.")
      process.exit(1)
    }

    return settings
  }
}
