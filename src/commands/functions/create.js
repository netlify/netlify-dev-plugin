const fs = require('fs-extra')
const path = require('path')
const copy = require('copy-template-dir')
const { flags } = require('@oclif/command')
const Command = require('@netlify/cli-utils')
const inquirer = require('inquirer')
const readRepoURL = require('../../utils/readRepoURL')
const http = require('http')
const fetch = require('node-fetch')
const cp = require('child_process')

const templatesDir = path.resolve(__dirname, '../../functions-templates')

class FunctionsCreateCommand extends Command {
  async run() {
    const { flags, args } = this.parse(FunctionsCreateCommand)
    const { config } = this.netlify

    const functionsDir = ensureFunctionDirExists(flags, config)

    /* either download from URL or scaffold from template */
    if (flags.url) {
      await downloadFromURL(flags, args, functionsDir)
    } else {
      await scaffoldFromTemplate(flags, args, functionsDir, this.log)
    }
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
  url: flags.string({ char: 'u', description: 'pull template from URL' }),
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

// pick template from our existing templates
async function pickTemplate() {
  // let templates = fs.readdirSync(templatesDir).filter(x => x.split('.').length === 1) // only folders
  const registry = require(path.join(templatesDir, 'template-registry.js'))
  let templates = registry.sort((a, b) => (a.priority || 999) - (b.priority || 999)) // doesnt scale but will be ok for now
  const { chosentemplate } = await inquirer.prompt([
    {
      name: 'chosentemplate',
      message: 'pick a template',
      type: 'list',
      choices: templates.map(t => ({
        // confusing but this is the format inquirer wants
        name: t.description,
        value: t.name,
        short: t.name
      }))
    }
  ])
  return registry.find(x => x.name === chosentemplate)
}

/* get functions dir (and make it if necessary) */
function ensureFunctionDirExists(flags, config) {
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
  return functionsDir
}

// Download files from a given github URL
async function downloadFromURL(flags, args, functionsDir) {
  const folderContents = await readRepoURL(flags.url)
  const functionName = flags.url.split('/').slice(-1)[0]
  const nameToUse = await getNameFromArgs(args, flags, functionName)
  const fnFolder = path.join(functionsDir, nameToUse)
  if (fs.existsSync(fnFolder + '.js') && fs.lstatSync(fnFolder + '.js').isFile()) {
    this.log(`A single file version of the function ${name} already exists at ${fnFolder}.js`)
    process.exit(1)
  }

  try {
    fs.mkdirSync(fnFolder, { recursive: true })
  } catch (e) {
    // Ignore
  }
  await Promise.all(
    folderContents.map(({ name, download_url }) => {
      return fetch(download_url).then(res => {
        const finalName = path.basename(name, '.js') === functionName ? nameToUse + '.js' : name
        const dest = fs.createWriteStream(path.join(fnFolder, finalName))
        res.body.pipe(dest)
      })
    })
  )

  console.log(`installing dependencies for ${nameToUse}...`)
  cp.exec('npm i', { cwd: path.join(functionsDir, nameToUse) }, () => {
    console.log(`installing dependencies for ${nameToUse} complete `)
  })
}

// no --url flag specified, pick from a provided template
async function scaffoldFromTemplate(flags, args, functionsDir, log) {
  const { onComplete, name: templateName } = await pickTemplate() // pull the rest of the metadata from the template

  const pathToTemplate = path.join(templatesDir, templateName)
  if (!fs.existsSync(pathToTemplate)) {
    throw new Error(`there isnt a corresponding folder to the selected name, ${templateName} template is misconfigured`)
  }

  const name = await getNameFromArgs(args, flags, templateName)

  log(`Creating function ${name}`)
  const functionPath = ensureFunctionPathIsOk(functionsDir, flags, name)

  log('from ', pathToTemplate, ' to ', functionPath)
  const vars = { NETLIFY_STUFF_TO_REPLACTE: 'REPLACEMENT' } // SWYX: TODO
  let hasPackageJSON = false
  copy(pathToTemplate, functionPath, vars, (err, createdFiles) => {
    if (err) throw err
    createdFiles.forEach(filePath => {
      log(`Created ${filePath}`)
      if (filePath.includes('package.json')) hasPackageJSON = true
    })
    // rename functions with different names from default
    if (name !== templateName) {
      fs.renameSync(path.join(functionPath, templateName + '.js'), path.join(functionPath, name + '.js'))
    }
    // npm install
    if (hasPackageJSON) {
      console.log(`installing dependencies for ${name}...`)
      cp.exec('npm i', { cwd: path.join(functionPath) }, () => {
        console.log(`installing dependencies for ${name} complete `)
      })
    }

    if (onComplete) onComplete() // do whatever the template wants to do after it is scaffolded
  })
}

function ensureFunctionPathIsOk(functionsDir, flags, name) {
  // const functionPath = flags.dir ? path.join(functionsDir, name, name + '.js') : path.join(functionsDir, name + '.js')
  const functionPath = path.join(functionsDir, name)
  if (fs.existsSync(functionPath)) {
    this.log(`Function ${functionPath} already exists, cancelling...`)
    process.exit(1)
  }
  // if (flags.dir) {
  //   const fnFolder = path.join(functionsDir, name)
  //   if (fs.existsSync(fnFolder + '.js') && fs.lstatSync(fnFolder + '.js').isFile()) {
  //     this.log(`A single file version of the function ${name} already exists at ${fnFolder}.js`)
  //     process.exit(1)
  //   }

  //   try {
  //     fs.mkdirSync(fnFolder, { recursive: true })
  //   } catch (e) {
  //     // Ignore
  //   }
  // } else if (fs.existsSync(functionPath.replace(/\.js/, ''))) {
  //   this.log(`A folder version of the function ${name} already exists at ${functionPath.replace(/\.js/, '')}`)
  //   process.exit(1)
  // }
  return functionPath
}
