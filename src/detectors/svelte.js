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
  if (!hasRequiredDeps(["svelte"])) return false;

  /** everything below now assumes that we are within vue */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ["dev", "start", "run"],
    preferredCommand: "npm run dev"
  });

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(["npm", "dev"]);
  }

  return {
    type: "svelte",
    command: getYarnOrNPMCommand(),
    port: 8888,
    proxyPort: 5000,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${5000}(/)?`, "g"),
    dist: "dist"
  };
};
