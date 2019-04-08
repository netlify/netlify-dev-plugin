const {
  hasRequiredDeps,
  hasRequiredFiles,
  getYarnOrNPM,
  scanScripts
} = require("./utils/jsdetect");
module.exports = function() {
  // REQUIRED FILES
  if (!hasRequiredFiles(["package.json", "static.config.js"])) return false;
  // REQUIRED DEPS
  if (!hasRequiredDeps(["react-static"])) return false;

  /** everything below now assumes that we are within react-static */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ["start", "develop", "dev"],
    preferredCommand: "react-static start"
  });

  const yarnExists = existsSync("yarn.lock");
  return {
    type: "react-static",
    command: getYarnOrNPM(),
    port: 8888,
    proxyPort: 3000,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, "g"),
    dist: "dist"
  };
};
