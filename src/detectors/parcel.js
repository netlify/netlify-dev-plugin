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
  if (!hasRequiredDeps(["parcel"]) && !hasRequiredDeps(["parcel-bundler"]))
    return false;

  /** everything below now assumes that we are within react-static */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ["start", "develop", "dev"],
    preferredCommand: "parcel"
  });

  if (possibleArgsArrs.length === 0) {
    // ofer to run it when the user doesnt have any scripts setup! 🤯
    possibleArgsArrs.push(["parcel", "start"]);
  }
  return {
    type: "parcel",
    command: getYarnOrNPMCommand(),
    port: 8888,
    proxyPort: 1234,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${1234}(/)?`, "g"),
    dist: "dist"
  };
};
