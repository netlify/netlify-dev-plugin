const {spawn} = require('child_process')

module.exports.runProcess = ({ cmd, args, env = {} }, log, error)  => {
  const ps = spawn(cmd, args, env);

  ps.stdout.on('data', data => {
    log(`INFO: ${data}`)
  })

  ps.stderr.on('data', data => {
    error(`ERROR: ${data}`)
  })

  ps.on('close', code => process.exit(code))
  ps.on('SIGINT', () => process.exit())
  ps.on('SIGTERM', () => process.exit())
}
