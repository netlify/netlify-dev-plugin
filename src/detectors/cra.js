const {
  hasRequiredDeps,
  hasRequiredFiles,
  getYarnOrNPM,
  scanScripts
} = require("./utils/jsdetect");

/**
 * detection logic - artificial intelligence!
 *
 *
 * */
module.exports = function() {
  // REQUIRED FILES
  if (!hasRequiredFiles(["package.json"])) return false;
  // REQUIRED DEPS
  if (!hasRequiredDeps(["react-scripts"])) return false;

  /** everything below now assumes that we are within create-react-app */

  const possibleArgsArrs = scanScripts({
    preferredScriptsArr: ["start", "serve", "run"],
    preferredCommand: "react-scripts start"
  });

  possibleArgsArrs.push(["react-scripts", "start"]);

  return {
    type: "create-react-app",
    command: getYarnOrNPM(),
    port: 8888, // the port that the Netlify Dev User will use
    proxyPort: 3000, // the port that create-react-app normally outputs
    env: { ...process.env, BROWSER: "none", PORT: 3000 },
    possibleArgsArrs,
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, "g"),
    dist: "dist"
  };
};
