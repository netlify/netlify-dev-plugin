const { existsSync, readFileSync } = require('fs')

module.exports = function() {
  if (!existsSync('package.json')) {
    return false
  }

  const packageSettings = JSON.parse(readFileSync('package.json', { encoding: 'utf8' }))
  const { dependencies, scripts } = packageSettings
  if (!(dependencies && dependencies.vue)) {
    return false
  }

  const npmCommand = scripts && ((scripts.serve && 'serve') || (scripts.start && 'start') || (scripts.run && 'run'))

  if (!npmCommand) {
    console.error("Couldn't determine the script to run. Use the -c flag.")
    process.exit(1)
  }

  const yarnExists = existsSync('yarn.lock')
  return {
    cmd: yarnExists ? 'yarn' : 'npm',
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    args: yarnExists || npmCommand != 'start' ? ['run', npmCommand] : [npmCommand],
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, 'g'),
    dist: 'dist'
  }
}
