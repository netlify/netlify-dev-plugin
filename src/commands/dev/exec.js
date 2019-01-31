const { spawn } = require('child_process')
const Command = require('@netlify/cli-utils')
const { getAddons } = require('netlify/src/addons')

class ExecCommand extends Command {
  async run() {
    const { site } = this.netlify

    if (site.id) {
      const accessToken = await this.authenticate()
      const addons = await getAddons(site.id, accessToken)
      addons.forEach(addon => {
        for (const key in addon.env) {
          process.env[key] = addon.env[key]
        }
      })
    }
    spawn(this.argv[0], this.argv.slice(1), { env: process.env, stdio: 'inherit' })
  }
}

ExecCommand.description = `Exec command
Runs a command within the netlify dev environment
`

ExecCommand.examples = ['$ netlify exec npm run bootstrap']

ExecCommand.strict = false
ExecCommand.parse = false

module.exports = ExecCommand
