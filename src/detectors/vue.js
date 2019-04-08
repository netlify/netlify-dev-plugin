const {
  hasRequiredDeps,
  hasRequiredFiles,
  getYarnOrNPM,
  scanScripts
} = require("./utils/jsdetect");

module.exports = function() {
  // REQUIRED FILES
  if (!hasRequiredFiles(["package.json"])) return false;
  // REQUIRED DEPS
  if (!hasRequiredDeps(["@vue/cli-service"])) return false;

  /** everything below now assumes that we are within vue */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ["serve", "start", "run"],
    preferredCommand: "vue-cli-service serve"
  });

  return {
    type: "vue-cli",
    command: getYarnOrNPM(),
    port: 8888,
    proxyPort: 8080,
    env: { ...process.env },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${8080}(/)?`, "g"),
    dist: "dist"
  };
};
