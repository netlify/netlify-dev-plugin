const fs = require('fs')
const path = require('path')
const { flags } = require('@oclif/command')
const Command = require('@netlify/cli-utils')
const inquirer = require('inquirer')

class FunctionsCreateCommand extends Command {
  async run() {
    const { flags, args } = this.parse(FunctionsCreateCommand)
    const name = await getNameFromArgs(args)
    const { config } = this.netlify
    const templates = fs
      .readdirSync(path.resolve(__dirname, '../../functions-templates'))
      .filter(x => path.extname(x) === '.js') // only js templates for now
    const { templatePath } = await inquirer.prompt([
      {
        name: 'templatePath',
        message: 'pick a template',
        type: 'list',
        choices: templates.map(t => {
          return require(path.resolve(__dirname, '../../functions-templates/', t)).metadata
          // ({ name: path.basename(t, '.js') })
        })
      }
    ])

    let template = fs
      .readFileSync(path.resolve(__dirname, `../../functions-templates/${templatePath}.js`))
      .toString()
      .split('// --- Netlify Template Below -- //')
    if (template.length !== 2) throw new Error('template ' + templatePath + ' badly formatted')
    template = '// scaffolded from `netlify functions:create` \n' + template[1]

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

FunctionsCreateCommand.examples = ['netlify functions:create hello-world']

FunctionsCreateCommand.flags = {
  functions: flags.string({ char: 'f', description: 'functions folder' }),
  dir: flags.boolean({
    char: 'd',
    description: 'create function as a directory'
  })
}
module.exports = FunctionsCreateCommand

// prompt for a name if name not supplied
// we tried using required:true in oclif args (see below) but the error msg was very ugly
async function getNameFromArgs(args) {
  let { name } = args
  if (!name) {
    let responses = await inquirer.prompt([
      {
        name: 'name',
        message: 'name your function: ',
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
