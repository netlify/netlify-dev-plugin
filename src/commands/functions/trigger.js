const chalk = require("chalk");
const Command = require("@netlify/cli-utils");
const { flags } = require("@oclif/command");
const inquirer = require("inquirer");
// const AsciiTable = require("ascii-table");
const { serverSettings } = require("../../detect-server");
const fetch = require("node-fetch");

const { getFunctions } = require("../../utils/get-functions");

// https://www.netlify.com/docs/functions/#event-triggered-functions
const eventTriggeredFunctions = [
  "deploy-building",
  "deploy-succeeded",
  "deploy-failed",
  "deploy-locked",
  "deploy-unlocked",
  "split-test-activated",
  "split-test-deactivated",
  "split-test-modified",
  "submission-created",
  "identity-validate",
  "identity-signup",
  "identity-login"
];
class FunctionsTriggerCommand extends Command {
  async run() {
    let { flags } = this.parse(FunctionsTriggerCommand);
    const { api, site, config } = this.netlify;

    const functionsDir =
      flags.functions ||
      (config.dev && config.dev.functions) ||
      (config.build && config.build.functions);
    if (typeof functionsDir === "undefined") {
      this.error(
        "functions directory is undefined, did you forget to set it in netlify.toml?"
      );
      process.exit(1);
    }

    let settings = await serverSettings(Object.assign({}, config.dev, flags));

    if (!(settings && settings.command)) {
      settings = {
        noCmd: true,
        port: 8888,
        proxyPort: 3999,
        dist
      };
    }

    const functions = getFunctions(functionsDir);
    let functionToTrigger = flags.name;
    const isValidFn = Object.keys(functions).includes(functionToTrigger);
    if (!functionToTrigger || !isValidFn) {
      if (!isValidFn) {
        this.warn(
          `Invalid function name ${chalk.yellow(flags.name)} supplied as flag.`
        );
      }
      const { trigger } = await inquirer.prompt([
        {
          type: "list",
          message: "Pick a function to trigger",
          name: "trigger",
          choices: Object.keys(functions)
        }
      ]);
      functionToTrigger = trigger;
    }
    let headers = {};
    let body = {};
    if (eventTriggeredFunctions.includes(functionToTrigger)) {
      // https://www.netlify.com/docs/functions/#event-triggered-functions
      const parts = functionToTrigger.split("-");
      if (parts[0] === "identity") {
        // https://www.netlify.com/docs/functions/#identity-event-functions
        body.event = parts[1];
        body.user = {
          email: "foo@trust-this-company.com",
          user_metadata: {
            TODO: "mock our netliy identity user data better"
          }
        };
      } else {
        // non identity functions seem to have a different shape
        // https://www.netlify.com/docs/functions/#event-function-payloads
        body.payload = {
          TODO: "mock up payload data better"
        };
        body.site = {
          TODO: "mock up site data better"
        };
      }
    } else {
      // NOT an event triggered function, but may still want to simulate authentication locally
      const { isAuthed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "isAuthed",
          message: `Run with emulated Netlify Identity?`,
          default: true
        }
      ]);
      if (isAuthed) {
        headers = {
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb3VyY2UiOiJuZXRsaWZ5IGZ1bmN0aW9uczp0cmlnZ2VyIiwidGVzdERhdGEiOiJORVRMSUZZX0RFVl9MT0NBTExZX0VNVUxBVEVEX0pXVCJ9.Xb6vOFrfLUZmyUkXBbCvU4bM7q8tPilF0F03Wupap_c"
        };
        // you can decode this https://jwt.io/
        // {
        //   "source": "netlify functions:trigger",
        //   "testData": "NETLIFY_DEV_LOCALLY_EMULATED_JWT"
        // }
      }
    }
    // fetch
    fetch(
      `http://localhost:${
        settings.port
      }/.netlify/functions/${functionToTrigger}`,
      {
        method: "post",
        headers,
        body: JSON.stringify(body)
      }
    )
      .then(response => {
        let data;
        data = response.text();
        try {
          // data = response.json();
          data = JSON.parse(data);
        } catch (err) {}
        return data;
      })
      .then(console.log);
  }
}

FunctionsTriggerCommand.description = `trigger a function while in netlify dev with simulated data, good for testing function calls including Netlify's Event Triggered Functions`;
FunctionsTriggerCommand.aliases = ["function:trigger"];
FunctionsTriggerCommand.flags = {
  name: flags.string({ char: "n", description: "function name to trigger" }),
  functions: flags.string({
    char: "f",
    description: "Specify a functions folder to serve"
  })
};

// TODO make visible once implementation complete
FunctionsTriggerCommand.hidden = false;

module.exports = FunctionsTriggerCommand;
