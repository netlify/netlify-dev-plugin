const {flags} = require('@oclif/command')
const {spawn} = require('child_process')
const http = require('http')
const httpProxy = require('http-proxy')
const waitPort = require('wait-port')
const getPort = require('get-port')
const {serveFunctions} = require('@netlify/zip-it-and-ship-it')
const {serverSettings} = require('../../detect-server')
const Command = require('@netlify/cli-utils')
const {getAddons} = require('netlify/src/addons')

function cleanExit() {
  process.exit()
}

function isFunction(settings, req) {
  return settings.functionsPort && req.url.match(/^\/.netlify\/functions\/.+/)
}

function addonUrl(addonUrls, req) {
  const m = req.url.match(/^\/.netlify\/([^\/]+)(\/.*)/)
  const addonUrl = m && addonUrls[m[1]]
  return addonUrl ? `${addonUrl}${m[2]}` : null
}

async function startProxy(settings, addonUrls) {
  const rulesProxy = require('netlify-rules-proxy')

  await waitPort({port: settings.proxyPort})
  if (settings.functionsPort) {
    await waitPort({port: settings.functionsPort})
  }
  const port = await getPort({port: settings.port})
  const functionsServer = settings.functionsPort ?
    `http://localhost:${settings.functionsPort}` :
    null

  const proxy = httpProxy.createProxyServer({
    target: {
      host: 'localhost',
      port: settings.proxyPort,
    },
  })

  const rewriter = rulesProxy({publicFolder: settings.dist})

  const server = http.createServer(function (req, res) {
    if (isFunction(settings, req)) {
      return proxy.web(req, res, {target: functionsServer})
    }
    let url = addonUrl(addonUrls, req)
    if (url) {
      return proxy.web(req, res, {target: url})
    }

    rewriter(req, res, () => {
      if (isFunction(settings, req)) {
        return proxy.web(req, res, {target: functionsServer})
      }
      url = addonUrl(addonUrls, req)
      if (url) {
        return proxy.web(req, res, {target: url})
      }

      proxy.web(req, res, {target: `http://localhost:${settings.proxyPort}`})
    })
  })

  server.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head)
  })

  server.listen(port)
  return `http://localhost:${port}`
}

function startDevServer(settings, log, error) {
  if (settings.noCmd) {
    const StaticServer = require('static-dev-server')
    const server = new StaticServer({
      rootPath: settings.dist,
      name: 'netlify-dev',
      port: settings.proxyPort,
      templates: {
        notFound: '404.html',
      },
    })

    server.start(function () {
      log('Server listening to', settings.proxyPort)
    })
    return
  }

  const ps = spawn(settings.cmd, settings.args, {env: settings.env})

  ps.stdout.on('data', data => {
    log(`${data}`.replace(settings.urlRegexp, `$1$2${settings.port}$3`))
  })

  ps.stderr.on('data', data => {
    error(`${data}`)
  })

  ps.on('close', code => {
    process.exit(code)
  })

  ps.on('SIGINT', cleanExit)
  ps.on('SIGTERM', cleanExit)
}

class DevCommand extends Command {
  async run() {
    const {flags, args} = this.parse(DevCommand)
    const {api, site, config} = this.netlify
    const functionsDir =
      flags.functions || (config.build && config.build.functions)
    const addonUrls = {}
    if (site.id && !flags.offline) {
      const accessToken = await this.authenticate()
      const addons = await getAddons(site.id, accessToken)
      if (Array.isArray(addons)) {
        addons.forEach(addon => {
          addonUrls[addon.slug] = `${addon.config.site_url}/.netlify/${
            addon.slug
          }`
          for (const key in addon.env) {
            process.env[key] = process.env[key] || addon.env[key]
          }
        })
      }
      const api = this.netlify.api
      const apiSite = await api.getSite({site_id: site.id})
      // TODO: We should move the environment outside of build settings and possibly have a
      // `/api/v1/sites/:site_id/environment` endpoint for it that we can also gate access to
      // In the future and that we could make context dependend
      if (apiSite.build_settings && apiSite.build_settings.env) {
        for (const key in apiSite.build_settings.env) {
          process.env[key] = process.env[key] || apiSite.build_settings.env[key]
        }
      }
    }
    process.env.NETLIFY_DEV = 'true'
    let settings = serverSettings(config.dev)
    if (!(settings && settings.cmd)) {
      this.log('No dev server detected, using simple static server')
      settings = {
        noCmd: true,
        port: 8888,
        proxyPort: 3999,
        dist: config.build && config.build.publish,
      }
    }
    startDevServer(settings, this.log, this.error)
    if (functionsDir) {
      const fnSettings = await serveFunctions({functionsDir})
      settings.functionsPort = fnSettings.port
    }

    const url = await startProxy(settings, addonUrls)
    this.log(`Netlify dev server is now ready on ${url}`)
  }
}

DevCommand.description = `Local dev server
The dev command will run a local dev server with Netlify's proxy and redirect rules
`

DevCommand.examples = [
  '$ netlify dev',
  '$ netlify dev -c "yarn start"',
  '$ netlify dev -c hugo',
]

DevCommand.strict = false

DevCommand.flags = {
  cmd: flags.string({char: 'c', description: 'command to run'}),
  devport: flags.integer({
    char: 'd',
    description: 'port of the dev server started by command',
  }),
  port: flags.integer({char: 'p', description: 'port of netlify dev'}),
  dir: flags.integer({char: 'd', description: 'dir with static files'}),
  functions: flags.string({
    char: 'f',
    description: 'Specify a functions folder to serve',
  }),
  offline: flags.boolean({
    char: 'o',
    description: 'disables any features that require network access',
  }),
}

module.exports = DevCommand
