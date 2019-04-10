const { flags } = require("@oclif/command");
const execa = require("execa");
const http = require("http");
const httpProxy = require("http-proxy");
const waitPort = require("wait-port");
const getPort = require("get-port");
const chokidar = require("chokidar");
const { serveFunctions } = require("@netlify/zip-it-and-ship-it");
const { serverSettings } = require("../../detect-server");
const { detectFunctionsBuilder } = require("../../detect-functions-builder");
const Command = require("@netlify/cli-utils");
const { getAddons } = require("netlify/src/addons");
const { track } = require("@netlify/cli-utils/src/utils/telemetry");
const chalk = require("chalk");
const {
  NETLIFYDEV,
  NETLIFYDEVLOG,
  NETLIFYDEVWARN,
  NETLIFYDEVERR
} = require("../../cli-logo");
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

// Used as an optimization to avoid dual lookups for missing assets
const assetExtensionRegExp = /\.(html?|png|jpg|js|css|svg|gif|ico|woff|woff2)$/;

function alternativePathsFor(url) {
  const paths = [];
  if (url[url.length - 1] === "/") {
    const end = url.length - 1;
    if (url !== "/") {
      paths.push(url.slice(0, end) + ".html");
      paths.push(url.slice(0, end) + ".htm");
    }
    paths.push(url + "index.html");
    paths.push(url + "index.htm");
  } else if (!url.match(assetExtensionRegExp)) {
    paths.push(url + ".html");
    paths.push(url + ".htm");
    paths.push(url + "/index.html");
    paths.push(url + "/index.htm");
  }

  return paths;
}

function initializeProxy(port) {
  const proxy = httpProxy.createProxyServer({
    selfHandleResponse: true,
    target: {
      host: "localhost",
      port: port
    }
  });

  proxy.on("proxyRes", (proxyRes, req, res) => {
    if (
      proxyRes.statusCode === 404 &&
      req.alternativePaths &&
      req.alternativePaths.length
    ) {
      req.url = req.alternativePaths.shift();
      return proxy.web(req, res, req.proxyOptions);
    }
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.on("data", function(data) {
      res.write(data);
    });
    proxyRes.on("end", function() {
      res.end();
    });
  });

  return {
    web: (req, res, options) => {
      req.proxyOptions = options;
      req.alternativePaths = alternativePathsFor(req.url);
      return proxy.web(req, res, options);
    },
    ws: (req, socket, head) => proxy.ws(req, socket, head)
  };
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

  const proxy = initializeProxy(settings.proxyPort);

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

    const server = new StaticServer({
      rootPath: settings.dist,
      name: "netlify-dev",
      port: settings.proxyPort,
      templates: {
        notFound: "404.html"
      }
    });

    server.start(function() {
      log(`\n${NETLIFYDEVLOG} Server listening to`, settings.proxyPort);
    });
    return;
  }
  log(`${NETLIFYDEVLOG} Starting Netlify Dev with ${settings.type}`);
  const args =
    settings.command === "npm" ? ["run", ...settings.args] : settings.args;
  const ps = execa(settings.command, args, {
    env: settings.env,
    stdio: "inherit"
  });
  ps.on("close", code => process.exit(code));
  ps.on("SIGINT", process.exit);
  ps.on("SIGTERM", process.exit);
}

class DevCommand extends Command {
  async run() {
    this.log(`${NETLIFYDEV}`);
    let { flags } = this.parse(DevCommand);
    const { api, site, config } = this.netlify;
    const functionsDir =
      flags.functions ||
      (config.dev && config.dev.functions) ||
      (config.build && config.build.functions);
    let addonUrls = {};

    let accessToken = api.accessToken;
    if (site.id && !flags.offline) {
      const { addEnvVariables } = require("../../utils/dev");
      addonUrls = await addEnvVariables(api, site, accessToken);
    }
    process.env.NETLIFY_DEV = "true";

    let settings = await serverSettings(Object.assign({}, config.dev, flags));

    if (!(settings && settings.command)) {
      this.log(
        `${NETLIFYDEVWARN} No dev server detected, using simple static server`
      );
      let dist =
        (config.dev && config.dev.publish) ||
        (config.build && config.build.publish);
      if (!dist) {
        console.log(`${NETLIFYDEVLOG} Using current working directory`);
        this.log(
          `${NETLIFYDEVWARN} Unable to determine public folder to serve files from.`
        );
        this.log(
          `${NETLIFYDEVWARN} Setup a netlify.toml file with a [dev] section to specify your dev server settings.`
        );
        this.log(
          `${NETLIFYDEVWARN} See docs at: https://github.com/netlify/netlify-dev-plugin#project-detection`
        );
        this.log(
          `${NETLIFYDEVWARN} Using current working directory for now...`
        );
        dist = process.cwd();
      }
      settings = {
        noCmd: true,
        port: 8888,
        proxyPort: 3999,
        dist
      };
    }

    let url;

    startDevServer(settings, this.log, this.error);

    // serve functions from zip-it-and-ship-it
    // env variables relies on `url`, careful moving this code
    if (functionsDir) {
      const functionBuilder = await detectFunctionsBuilder(settings);
      if (functionBuilder) {
        await functionBuilder.build();
        const functionWatcher = chokidar.watch(functionBuilder.src);
        functionWatcher.on("add", functionBuilder.build);
        functionWatcher.on("change", functionBuilder.build);
        functionWatcher.on("unlink", functionBuilder.build);
      }
      const functionsPort = await getPort({ port: 34567 });
      const fnSettings = await serveFunctions({
        ...settings,
        port: functionsPort,
        functionsDir
      });
      settings.functionsPort = functionsPort;
    }

    const proxyUrl = await startProxy(settings, addonUrls);
    if (!url) {
      url = proxyUrl;
    }

    if (flags.live) {
      await waitPort({ port: settings.proxyPort });
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

    // Todo hoist this telemetry `command` to CLI hook
    track("command", {
      command: "dev",
      projectType: settings.type || "custom",
      live: flags.live || false
    });

    // boxen doesnt support text wrapping yet https://github.com/sindresorhus/boxen/issues/16
    const banner = require("wrap-ansi")(
      chalk.bold(`${NETLIFYDEVLOG} Server now ready on ${url}`),
      70
    );
    process.env.URL = url;
    process.env.DEPLOY_URL = process.env.URL;

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
  command: flags.string({ char: "c", description: "command to run" }),
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
