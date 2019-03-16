const fs = require('fs-extra')
const path = require('path')
const { flags } = require('@oclif/command')
const Command = require('@netlify/cli-utils')
const inquirer = require('inquirer')

const templatesDir = path.resolve(__dirname, '../../functions-templates')
class FunctionsCreateCommand extends Command {
  async run() {
    const { flags, args } = this.parse(FunctionsCreateCommand)
    const { config } = this.netlify
    let templates = fs.readdirSync(templatesDir).filter(x => path.extname(x) === '.js') // only js templates for now
    templates = templates
      .map(t => require(path.join(templatesDir, t)))
      .sort((a, b) => (a.priority || 999) - (b.priority || 999)) // doesnt scale but will be ok for now
    const { templatePath } = await inquirer.prompt([
      {
        name: 'templatePath',
        message: 'pick a template',
        type: 'list',
        choices: templates.map(t => t.metadata)
      }
    ])
    // pull the rest of the metadata from the template
    const { onComplete, copyAssets, templateCode } = require(path.join(templatesDir, templatePath))

    let template
    try {
      template = templateCode() // we may pass in args in future to customize the template
    } catch (err) {
      console.error('an error occurred retrieving template code, please check ' + templatePath, err)
      process.exit(0)
    }

    const name = await getNameFromArgs(args, flags, path.basename(templatePath, '.js'))

    this.log(`Creating function ${name}`)

    const functionsDir = flags.functions || (config.build && config.build.functions)
    if (!functionsDir) {
      this.log('No functions folder specified in netlify.toml or as an argument')
      process.exit(1)
    }

    if (!fs.existsSync(functionsDir)) {
      console.log(`functions folder ${functionsDir} specified in netlify.toml but folder not found, creating it...`)
      fs.mkdirSync(functionsDir)
      console.log(`functions folder ${functionsDir} created`)
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
      this.log(`A folder version of the function ${name} already exists at ${functionPath.replace(/\.js/, '')}`)
      process.exit(1)
    }

    fs.writeFileSync(functionPath, template)
    if (copyAssets) {
      copyAssets.forEach(src =>
        fs.copySync(path.join(templatesDir, 'assets', src), path.join(functionsDir, src), {
          overwrite: false,
          errorOnExist: false // went with this to make it idempotent, might change in future
        })
      ) // copy assets if specified
    }
    if (onComplete) onComplete() // do whatever the template wants to do after it is scaffolded
  }
}

FunctionsCreateCommand.args = [
  {
    name: 'name',
    // required: true, // tried this but the error message is very ugly
    description: 'name of your new function file inside your functions folder'
  }
]

FunctionsCreateCommand.description = `create a new function locally`

FunctionsCreateCommand.examples = [
  'netlify functions:create',
  'netlify functions:create hello-world',
  'netlify functions:create --name hello-world',
  'netlify functions:create hello-world --dir'
]

FunctionsCreateCommand.flags = {
  name: flags.string({ char: 'n', description: 'function name' }),
  functions: flags.string({ char: 'f', description: 'functions folder' }),
  dir: flags.boolean({
    char: 'd',
    description: 'create function as a directory'
  })
}
module.exports = FunctionsCreateCommand

// prompt for a name if name not supplied
async function getNameFromArgs(args, flags, defaultName) {
  if (flags.name && args.name) throw new Error('function name specified in both flag and arg format, pick one')
  let name
  if (flags.name && !args.name) name = flags.name
  // use flag if exists
  else if (!flags.name && args.name) name = args.name

  // if neither are specified, prompt for it
  if (!name) {
    let responses = await inquirer.prompt([
      {
        name: 'name',
        message: 'name your function: ',
        default: defaultName,
        type: 'input',
        validate: val => !!val && /^[\w\-.]+$/i.test(val)
        // make sure it is not undefined and is a valid filename.
        // this has some nuance i have ignored, eg crossenv and i18n concerns
      }
    ])
    name = responses.name
  }
  return name
}
