const execa = require("execa");
const Command = require("@netlify/cli-utils");
const { track } = require("@netlify/cli-utils/src/utils/telemetry");
const {
  // NETLIFYDEV,
  NETLIFYDEVLOG,
  // NETLIFYDEVWARN,
  NETLIFYDEVERR
} = require("netlify-cli-logo");

class HookCommand extends Command {
  async run() {
    const { site, api, config } = this.netlify;

    if (!(config && config.dev && config.dev.hooks)) {
      this.log(`${NETLIFYDEVERR} No hooks defined in your netlify.toml.`);
      process.exit(1);
    }

    if (site.id) {
      this.log(
        `${NETLIFYDEVLOG} Checking your site's environment variables...`
      ); // just to show some visual response first
      const accessToken = api.accessToken;
      const { addEnvVariables } = require("../../utils/dev");
      await addEnvVariables(api, site, accessToken);
    } else {
      this.log(
        `${NETLIFYDEVERR} No Site ID detected. You probably forgot to run \`netlify link\` or \`netlify init\`. `
      );
    }

    const hook = this.argv.join(" ");
    const cmd = config.dev.hooks[hook];

    if (!cmd) {
      this.log(
        `${NETLIFYDEVERR} No hook called "${hook}" defined in your netlify.toml.`
      );
      process.exit(1);
    }

    execa(cmd.split(" ")[0], cmd.split(" ").slice(1), {
      env: process.env,
      stdio: "inherit"
    });
    // Todo hoist this telemetry `command` to CLI hook
    track("command", {
      command: "dev:hook"
    });
  }
}

HookCommand.description = `Hook command
Responds to one of the named hook defined in your netlify.toml file.
Used with \`netlify dev --live\` to handle updates on webhooks triggered
by external systems like Contentful, Sanity, etc...
`;

HookCommand.examples = ["$ netlify hook Contentful"];

HookCommand.strict = false;
HookCommand.parse = false;

module.exports = HookCommand;
