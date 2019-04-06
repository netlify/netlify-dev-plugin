const { Command, flags } = require("@oclif/command");
const chalk = require("chalk");
const NETLIFYDEV = `[${chalk.cyan("Netlify Dev")}]`;

class FunctionsUpdateCommand extends Command {
  async run() {
    this.log(`${NETLIFYDEV} NOT IMPLEMENTED YET: update a function`);
  }
}

FunctionsUpdateCommand.description = `update a function
...
Extra documentation goes here
`;
FunctionsUpdateCommand.aliases = ["function:update"];
FunctionsUpdateCommand.flags = {
  name: flags.string({ char: "n", description: "name to print" })
};

// TODO make visible once implementation complete
FunctionsUpdateCommand.hidden = true;

module.exports = FunctionsUpdateCommand;
