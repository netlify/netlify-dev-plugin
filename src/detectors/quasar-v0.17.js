const {
  hasRequiredDeps,
  hasRequiredFiles,
  getYarnOrNPMCommand,
  scanScripts
} = require("./utils/jsdetect");

module.exports = function() {
  // REQUIRED FILES
  if (!hasRequiredFiles(["package.json"])) return false;
  // REQUIRED DEPS
  if (!hasRequiredDeps(["quasar-cli"])) return false;

  /** everything below now assumes that we are within Quasar */
  
  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ["serve", "start", "run", "dev"],
    preferredCommand: "quasar dev"
  });

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup!
    possibleArgsArrs.push(["quasar", "dev"]);
  }

  return {
    type: "quasar-cli-v0.17",
    command: getYarnOrNPMCommand(),
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, "g"),
    dist: ".quasar"
  };
};