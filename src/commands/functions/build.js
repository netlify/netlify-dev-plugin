const fs = require('fs')
const { flags } = require('@oclif/command')
const Command = require('@netlify/cli-utils')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')

class FunctionsBuildCommand extends Command {
  async run() {
    const { flags, args } = this.parse(FunctionsBuildCommand)
    const { config } = this.netlify

    const src = flags.src || config.build.functionsSource
    const dst = flags.functions || config.build.functions

    if (src === dst) {
      this.log("Source and destination for function build can't be the same")
      process.exit(1)
    }

    if (!src) {
      this.log('You must specify a source folder')
      process.exit(1)
    }

    if (!dst) {
      this.log('You must specify a functions folder')
      process.exit(1)
    }

    fs.mkdirSync(dst, { recursive: true })

    this.log('Building functions')
    zipFunctions(src, dst, { skipGo: true })
    this.log('Functions buildt to ', dst)
  }
}

FunctionsBuildCommand.description = `build functions locally
`

FunctionsBuildCommand.flags = {
  functions: flags.string({
    char: 'f',
    description: 'Specify a functions folder to build to'
  }),
  src: flags.string({
    char: 's',
    description: 'Specify the source folder for the functions'
  })
}

module.exports = FunctionsBuildCommand
