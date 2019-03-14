const { existsSync, readFileSync } = require('fs')

module.exports = function() {
  if (!existsSync('package.json')) {
    return false
  }

  const packageSettings = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }))
  const { dependencies, scripts } = packageSettings
  if (!(dependencies && dependencies['react-scripts'])) {
    return false
  }

  const npmCommand = scripts && ((scripts.start && 'start') || (scripts.serve && 'serve') || (scripts.run && 'run'))

  if (!npmCommand) {
    console.error("Couldn't determine the script to run. Use the -c flag.")
    process.exit(1)
  }

  const yarnExists = existsSync('yarn.lock')
  return {
    cmd: yarnExists ? 'yarn' : 'npm',
    port: 8888,
    proxyPort: 3000,
    env: { ...process.env, BROWSER: 'none', PORT: 3000 },
    args: yarnExists || npmCommand != 'start' ? ['run', npmCommand] : [npmCommand],
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, 'g'),
    dist: 'dist'
  }
}
