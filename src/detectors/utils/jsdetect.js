/**
 * responsible for any js based projects
 * and can therefore build in assumptions that only js projects have
 *
 */
const { existsSync, readFileSync } = require("fs");
let pkgJSON = null,
  yarnExists = false;

/** hold package.json in a singleton so we dont do expensive parsing repeatedly */
function getPkgJSON() {
  if (pkgJSON) return pkgJSON;
  else return JSON.parse(readFileSync("package.json", { encoding: "utf8" }));
}
function getYarnOrNPMCommand() {
  if (!yarnExists) {
    yarnExists = existsSync("yarn.lock") ? "yes" : "no";
  }
  return yarnExists === "yes" ? "yarn" : "npm run";
}

/**
 * real utiltiies are down here
 *
 */

function hasRequiredDeps(requiredDepArray) {
  const { dependencies, devDependencies } = getPkgJSON();
  for (let depName of requiredDepArray) {
    const hasItInDeps = dependencies && dependencies[depName];
    const hasItInDevDeps = devDependencies && devDependencies[depName];
    if (!hasItInDeps && !hasItInDevDeps) {
      return false;
    }
  }
  return true;
}
function hasRequiredFiles(filenameArr) {
  for (const filename of filenameArr) {
    if (!existsSync(filename)) {
      return false;
    }
  }
  return true;
}

// preferredScriptsArr is in decreasing order of preference
function scanScripts({ preferredScriptsArr, preferredCommand }) {
  const { scripts } = getPkgJSON();

  /**
   *
   * NOTE: we return an array of arrays (args)
   * because we may want to supply extra args in some setups
   *
   * e.g. ['eleventy', '--serve', '--watch']
   *
   * array will in future be sorted by likelihood of what we want
   *
   *  */
  // this is very simplistic logic, we can offer far more intelligent logic later
  // eg make a dependency tree of npm scripts and offer the parentest node first
  let possibleArgsArrs = preferredScriptsArr
    .filter(s => Object.keys(scripts).includes(s))
    .filter(s => !scripts[s].includes("netlify dev")) // prevent netlify dev calling netlify dev
    .map(x => [x]); // make into arr of arrs

  Object.entries(scripts)
    .filter(([k]) => !preferredScriptsArr.includes(k))
    .forEach(([k, v]) => {
      if (v.includes(preferredCommand)) possibleArgsArrs.push([k]);
    });

  return possibleArgsArrs;
}

module.exports = {
  hasRequiredDeps,
  hasRequiredFiles,
  getYarnOrNPMCommand,
  scanScripts
};
