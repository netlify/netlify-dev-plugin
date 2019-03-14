const fs = require('fs')
const path = require('path')
const { flags } = require('@oclif/command')
const Command = require('@netlify/cli-utils')

const template = `async function hello() {
  return Promise.resolve('Hello, World')
}

exports.handler = async function(event, context) {
  try {
    const body = await hello()
    return { statusCode: 200, body }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
`

class FunctionsCreateCommand extends Command {
  async run() {
    const { flags, args } = this.parse(FunctionsCreateCommand)
    const { name } = args
    const { config } = this.netlify

    this.log(`Creating function ${name}`)

    const functionsDir = flags.functions || (config.build && config.build.functions)
    if (!functionsDir) {
      this.log('No functions folder specified in netlify.toml or as an argument')
      process.exit(1)
    }

    if (!fs.existsSync(functionsDir)) {
      fs.mkdir(functionsDir)
    }

    const functionPath = flags.dir ? path.join(functionsDir, name, name + '.js') : path.join(functionsDir, name + '.js')
    if (fs.existsSync(functionPath)) {
      this.log(`Function ${functionPath} already exists`)
      process.exit(1)
    }

    if (flags.dir) {
      const fnFolder = path.join(functionsDir, name)
      if (fs.existsSync(fnFolder + '.js') && fs.lstatSync(fnFolder + '.js').isFile()) {
        this.log(`A single file version of the function ${name} already exists at ${fnFolder}.js`)
        process.exit(1)
      }

      try {
        fs.mkdirSync(fnFolder, { recursive: true })
      } catch (e) {
        // Ignore
      }
    } else if (fs.existsSync(functionPath.replace(/\.js/, ''))) {
      this.log(`A folder version of the function ${name} alreadt exists at ${functionPath.replace(/\.js/, '')}`)
      process.exit(1)
    }

    fs.writeFileSync(functionPath, template)
  }
}

FunctionsCreateCommand.args = [{ name: 'name' }]

FunctionsCreateCommand.description = `create a new function locally
`

FunctionsCreateCommand.examples = ['netlify functions:create hello-world']

FunctionsCreateCommand.flags = {
  functions: flags.string({ char: 'f', description: 'functions folder' }),
  dir: flags.boolean({
    char: 'd',
    description: 'create function as a directory'
  })
}
module.exports = FunctionsCreateCommand
