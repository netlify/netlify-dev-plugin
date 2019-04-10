const { Command, flags } = require("@oclif/command");
const chalk = require("chalk");
const {
  NETLIFYDEV,
  NETLIFYDEVLOG,
  NETLIFYDEVWARN,
  NETLIFYDEVERR
} = require("../../cli-logo");

class FunctionsUpdateCommand extends Command {
  async run() {
    this.log(`${NETLIFYDEVERR} NOT IMPLEMENTED YET: update a function`);
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
