/**
 * responsible for any js based projects
 * and can therefore build in assumptions that only js projects have
 *
 */
const { existsSync, readFileSync } = require("fs");

function hasRequiredDeps(requiredDepArray) {
  const { dependencies, devDependencies } = JSON.parse(
    readFileSync("package.json", { encoding: "utf8" })
  );
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

/**
 *
 * other utilites, not requirements related
 */

function getYarnOrNPM() {
  const yarnExists = existsSync("yarn.lock");
  return yarnExists ? "yarn" : "npm";
}

// preferredScriptsArr is in decreasing order of preference
function scanScripts({ preferredScriptsArr, preferredCommand }) {
  const { scripts } = JSON.parse(
    readFileSync("package.json", { encoding: "utf8" })
  );

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
  let possibleArgsArrs = preferredScriptsArr
    .filter(s => Object.keys(scripts).includes(s))
    .filter(s => !scripts[s].includes("netlify dev")) // prevent netlify dev calling netlify dev
    .map(x => [x]); // make into arr of arrs

  Object.entries(scripts)
    .filter(([k]) => !preferredScriptsArr.includes(k))
    .forEach(([k, v]) => {
      if (v.includes(preferredCommand)) possibleArgsArrs.push([k]);
    });

  // // for example.. in your detector you
  // // could allow for running dev server
  // // even if there's no script setup for it
  // possibleArgsArrs.push(["react-scripts", "start"]);

  return possibleArgsArrs;
}

module.exports = {
  hasRequiredDeps,
  hasRequiredFiles,
  getYarnOrNPM,
  scanScripts
};
