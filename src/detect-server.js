const path = require("path");
const chalk = require("chalk");
const {
  NETLIFYDEV,
  NETLIFYDEVLOG,
  NETLIFYDEVWARN,
  NETLIFYDEVERR
} = require("./cli-logo");
const inquirer = require("inquirer");
const fs = require("fs");
const detectors = fs
  .readdirSync(path.join(__dirname, "detectors"))
  .filter(x => x.endsWith(".js")) // only accept .js detector files
  .map(det => require(path.join(__dirname, `detectors/${det}`)));

module.exports.serverSettings = async devConfig => {
  let settingsArr = [],
    settings = null;
  for (const i in detectors) {
    const detectorResult = detectors[i]();
    if (detectorResult) settingsArr.push(detectorResult);
  }
  if (settingsArr.length === 1) {
    // vast majority of projects will only have one matching detector
    settings = settingsArr[0];
    settings.args = settings.possibleArgsArrs[0]; // just pick the first one
    if (!settings.args) {
      const { scripts } = JSON.parse(
        fs.readFileSync("package.json", { encoding: "utf8" })
      );
      console.error(
        "empty args assigned, this is an internal Netlify Dev bug, please report your settings and scripts so we can improve",
        { scripts, settings }
      );
      process.exit(1);
    }
  } else if (settingsArr.length > 1) {
    /** multiple matching detectors, make the user choose */
    // lazy loading on purpose
    inquirer.registerPrompt(
      "autocomplete",
      require("inquirer-autocomplete-prompt")
    );
    const fuzzy = require("fuzzy");
    const scriptInquirerOptions = formatSettingsArrForInquirer(settingsArr);
    const { chosenSetting } = await inquirer.prompt({
      name: "chosenSetting",
      message: `Multiple possible start commands found`,
      type: "autocomplete",
      source: async function(_, input) {
        if (!input || input === "") {
          return scriptInquirerOptions;
        }
        // only show filtered results
        return filterSettings(scriptInquirerOptions, input);
      }
    });
    settings = chosenSetting; // finally! we have a selected option
    // TODO: offer to save this setting to netlify.toml so you dont keep doing this

    /** utiltities for the inquirer section above */
    function filterSettings(scriptInquirerOptions, input) {
      const filteredSettings = fuzzy.filter(
        input,
        scriptInquirerOptions.map(x => x.name)
      );
      const filteredSettingNames = filteredSettings.map(x =>
        input ? x.string : x
      );
      return scriptInquirerOptions.filter(t =>
        filteredSettingNames.includes(t.name)
      );
    }

    /** utiltities for the inquirer section above */
    function formatSettingsArrForInquirer(settingsArr) {
      let ans = [];
      settingsArr.forEach(setting => {
        setting.possibleArgsArrs.forEach(args => {
          ans.push({
            name: `[${chalk.yellow(setting.type)}] ${
              setting.command
            } ${args.join(" ")}`,
            value: { ...setting, args },
            short: setting.type + "-" + args.join(" ")
          });
        });
      });
      return ans;
    }
  }

  /** everything below assumes we have settled on one detector */
  const tellUser = settingsField => dV =>
    console.log(
      `${NETLIFYDEVLOG} Overriding ${chalk.yellow(
        settingsField
      )} with setting derived from netlify.toml [dev] block: `,
      dV
    );

  if (devConfig) {
    settings = settings || {};
    if (devConfig.command) {
      settings.command = assignLoudly(
        devConfig.command.split(/\s/)[0],
        settings.command || null,
        tellUser("command")
      ); // if settings.command is empty, its bc no settings matched
      settings.args = assignLoudly(
        devConfig.command.split(/\s/).slice(1),
        settings.command || null,
        tellUser("command")
      ); // if settings.command is empty, its bc no settings matched
    }
    if (devConfig.port) {
      settings.proxyPort = assignLoudly(
        devConfig.port,
        settings.proxyPort || null,
        tellUser("proxyPort")
      ); // if settings.proxyPort is empty, its bc no settings matched
      const regexp =
        devConfig.urlRegexp ||
        new RegExp(`(http://)([^:]+:)${devConfig.port}(/)?`, "g");
      settings.urlRegexp = assignLoudly(
        settings.urlRegexp,
        regexp,
        tellUser("urlRegexp")
      );
    }
    settings.dist = devConfig.publish || settings.dist; // dont loudassign if they dont need it
  }
  return settings;
};

// if first arg is undefined, use default, but tell user about it in case it is unintentional
function assignLoudly(
  optionalValue,
  defaultValue,
  tellUser = dV => console.log(`No value specified, using fallback of `, dV)
) {
  if (defaultValue === undefined) throw new Error("must have a defaultValue");
  if (defaultValue !== optionalValue && optionalValue === undefined) {
    tellUser(defaultValue);
    return defaultValue;
  } else {
    return optionalValue;
  }
}
