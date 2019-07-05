const Command = require("@netlify/cli-utils");
const { flags } = require("@oclif/command");
const AsciiTable = require("ascii-table");
const { getFunctions } = require("../../utils/get-functions");
class FunctionsListCommand extends Command {
  async run() {
    let { flags } = this.parse(FunctionsListCommand);
    const { api, site, config } = this.netlify;
    const functionsDir =
      flags.functions ||
      (config.dev && config.dev.functions) ||
      (config.build && config.build.functions);
    var table = new AsciiTable("Netlify Functions");
    const functions = getFunctions(functionsDir);

    table.setHeading("Name", "Url", "moduleDir");

    Object.entries(functions).forEach(([functionName, { moduleDir }]) => {
      table.addRow(
        functionName,
        `/.netlify/functions/${functionName}`,
        moduleDir
      );
    });
    this.log(`netlify functions:list NOT NOT IMPLEMENTED YET`);
    this.log(table.toString());
  }
}

FunctionsListCommand.description = `list functions that exist locally

Helpful for making sure that you have formatted your functions correctly

NOT the same as listing the functions that have been deployed. For that info you need to go to your Netlify deploy log.
`;
FunctionsListCommand.aliases = ["function:list"];
FunctionsListCommand.flags = {
  name: flags.string({ char: "n", description: "name to print" }),
  functions: flags.string({
    char: "f",
    description: "Specify a functions folder to serve"
  })
};

// TODO make visible once implementation complete
FunctionsListCommand.hidden = true;

module.exports = FunctionsListCommand;
