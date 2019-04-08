const {
  hasRequiredDeps,
  hasRequiredFiles,
  getYarnOrNPM,
  scanScripts
} = require("./utils/jsdetect");
module.exports = function() {
  // REQUIRED FILES
  if (!hasRequiredFiles(["package.json", "gatsby-config.js"])) return false;
  // REQUIRED DEPS
  if (!hasRequiredDeps(["gatsby"])) return false;

  /** everything below now assumes that we are within gatsby */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ["start", "develop", "dev"],
    preferredCommand: "gatsby develop"
  });

  return {
    type: "gatsby",
    command: getYarnOrNPM(),
    port: 8888,
    proxyPort: 8000,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8000}(/)?`, "g"),
    dist: "public"
  };
};
