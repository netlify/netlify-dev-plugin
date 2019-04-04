const { flags } = require("@oclif/command");
const execa = require("execa");
const http = require("http");
const httpProxy = require("http-proxy");
const waitPort = require("wait-port");
const getPort = require("get-port");
const { serveFunctions } = require("@netlify/zip-it-and-ship-it");
const { serverSettings } = require("../../detect-server");
const Command = require("@netlify/cli-utils");
const { getAddons } = require("netlify/src/addons");
const { track } = require("@netlify/cli-utils/src/utils/telemetry");
const chalk = require("chalk");
const boxen = require("boxen");
const { createTunnel, connectTunnel } = require("../../live-tunnel");

function isFunction(settings, req) {
  return settings.functionsPort && req.url.match(/^\/.netlify\/functions\/.+/);
}

function addonUrl(addonUrls, req) {
  const m = req.url.match(/^\/.netlify\/([^\/]+)(\/.*)/);
  const addonUrl = m && addonUrls[m[1]];
  return addonUrl ? `${addonUrl}${m[2]}` : null;
}

async function startProxy(settings, addonUrls) {
  const rulesProxy = require("@netlify/rules-proxy");

  await waitPort({ port: settings.proxyPort });
  if (settings.functionsPort) {
    await waitPort({ port: settings.functionsPort });
  }
  const port = await getPort({ port: settings.port });
  const functionsServer = settings.functionsPort
    ? `http://localhost:${settings.functionsPort}`
    : null;

  const proxy = httpProxy.createProxyServer({
    target: {
      host: "localhost",
      port: settings.proxyPort
    }
  });

  const rewriter = rulesProxy({ publicFolder: settings.dist });

  const server = http.createServer(function(req, res) {
    if (isFunction(settings, req)) {
      return proxy.web(req, res, { target: functionsServer });
    }
    let url = addonUrl(addonUrls, req);
    if (url) {
      return proxy.web(req, res, { target: url });
    }

    rewriter(req, res, () => {
      if (isFunction(settings, req)) {
        return proxy.web(req, res, { target: functionsServer });
      }
      url = addonUrl(addonUrls, req);
      if (url) {
        return proxy.web(req, res, { target: url });
      }

      proxy.web(req, res, { target: `http://localhost:${settings.proxyPort}` });
    });
  });

  server.on("upgrade", function(req, socket, head) {
    proxy.ws(req, socket, head);
  });

  server.listen(port);
  return `http://localhost:${port}`;
}

function startDevServer(settings, log, error) {
  if (settings.noCmd) {
    const StaticServer = require("static-server");
    if (!settings.dist) {
      log(
        "Unable to determine public folder for the dev server.\nSetup a netlify.toml file with a [dev] section to specify your dev server settings."
      );
      process.exit(1);
    }

    const server = new StaticServer({
      rootPath: settings.dist,
      name: "netlify-dev",
      port: settings.proxyPort,
      templates: {
        notFound: "404.html"
      }
    });

    server.start(function() {
      log("Server listening to", settings.proxyPort);
    });
    return;
  } else {
    log(`Starting netlify dev with ${settings.type}`);
    const ps = execa(settings.command, settings.args, {
      env: settings.env,
      stdio: "inherit",
      shell: true
    });
    ps.on("close", code => process.exit(code));
    ps.on("SIGINT", process.exit);
    ps.on("SIGTERM", process.exit);
  }
}

class DevCommand extends Command {
  async run() {
    const { flags, args } = this.parse(DevCommand);
    const { api, site, config } = this.netlify;
    const functionsDir =
      flags.functions ||
      (config.dev && config.dev.functions) ||
      (config.build && config.build.functions);
    const addonUrls = {};

    let accessToken = api.accessToken;
    if (site.id && !flags.offline) {
      accessToken = await this.authenticate();
      const addons = await getAddons(site.id, accessToken);
      if (Array.isArray(addons)) {
        addons.forEach(addon => {
          addonUrls[addon.slug] = `${addon.config.site_url}/.netlify/${
            addon.slug
          }`;
          for (const key in addon.env) {
            process.env[key] = process.env[key] || addon.env[key];
          }
        });
      }
      const api = this.netlify.api;
      const apiSite = await api.getSite({ site_id: site.id });
      // TODO: We should move the environment outside of build settings and possibly have a
      // `/api/v1/sites/:site_id/environment` endpoint for it that we can also gate access to
      // In the future and that we could make context dependend
      if (apiSite.build_settings && apiSite.build_settings.env) {
        for (const key in apiSite.build_settings.env) {
          process.env[key] =
            process.env[key] || apiSite.build_settings.env[key];
        }
      }
    }
    process.env.NETLIFY_DEV = "true";

    let settings = serverSettings(config.dev);
    if (!(settings && settings.command)) {
      this.log("No dev server detected, using simple static server");
      const dist =
        (config.dev && config.dev.publish) ||
        (config.build && config.build.publish);
      settings = {
        noCmd: true,
        port: 8888,
        proxyPort: 3999,
        dist
      };
    }

    let url;
    if (flags.live) {
      const liveSession = await createTunnel(site.id, accessToken, this.log);
      url = liveSession.session_url;
      process.env.BASE_URL = url;

      await connectTunnel(
        liveSession,
        accessToken,
        settings.port,
        this.log,
        this.error
      );
    }

    startDevServer(settings, this.log, this.error);

    if (functionsDir) {
      const fnSettings = await serveFunctions({ ...settings, functionsDir });
      settings.functionsPort = fnSettings.port;
    }

    const proxyUrl = await startProxy(settings, addonUrls);
    if (!url) {
      url = proxyUrl;
    }
    // Todo hoist this telemetry `command` to CLI hook
    track("command", {
      command: "dev",
      projectType: settings.type || "custom"
    });

    const banner = chalk.bold(`Netlify dev server is now ready on ${url}`);
    this.log(
      boxen(banner, {
        padding: 1,
        margin: 1,
        align: "center",
        borderColor: "#00c7b7"
      })
    );
  }
}

DevCommand.description = `Local dev server
The dev command will run a local dev server with Netlify's proxy and redirect rules
`;

DevCommand.examples = [
  "$ netlify dev",
  '$ netlify dev -c "yarn start"',
  "$ netlify dev -c hugo"
];

DevCommand.strict = false;

DevCommand.flags = {
  cmd: flags.string({ char: "c", description: "command to run" }),
  devport: flags.integer({
    char: "d",
    description: "port of the dev server started by command"
  }),
  port: flags.integer({ char: "p", description: "port of netlify dev" }),
  dir: flags.integer({ char: "d", description: "dir with static files" }),
  functions: flags.string({
    char: "f",
    description: "Specify a functions folder to serve"
  }),
  offline: flags.boolean({
    char: "o",
    description: "disables any features that require network access"
  }),
  live: flags.boolean({ char: "l", description: "Start a public live session" })
};

module.exports = DevCommand;
