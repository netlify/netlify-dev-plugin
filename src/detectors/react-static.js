const { existsSync, readFileSync } = require("fs");

module.exports = function() {
  if (!existsSync("static.config.js") || !existsSync("package.json")) {
    return false;
  }

  const packageSettings = JSON.parse(
    readFileSync("package.json", { encoding: "utf8" })
  );
  const { dependencies, scripts } = packageSettings;
  if (!(dependencies && dependencies["react-static"])) {
    return false;
  }

  const npmCommand =
    scripts &&
    ((scripts.start && "start") ||
      (scripts.develop && "develop") ||
      (scripts.dev && "dev"));
  if (!npmCommand) {
    if (!scripts) {
      console.error(
        "Couldn't determine the package.json script to run for this Gatsby project. Use the --command flag."
      );
      process.exit(1);
    }
    // search all the scripts for something that starts with 'react-static start'
    Object.entries(scripts).forEach(([k, v]) => {
      if (v.startsWith("react-static start")) {
        npmCommand = k;
      }
    });
    if (!npmCommand) {
      console.error(
        "Couldn't determine the package.json script to run for this React-Static project. Use the --command flag."
      );
      process.exit(1);
    } else {
      console.log("using npm script starting with react-static start: ", k);
    }
  }

  const yarnExists = existsSync("yarn.lock");
  return {
    type: "react-static",
    command: yarnExists ? "yarn" : "npm",
    port: 8888,
    proxyPort: 3000,
    env: { ...process.env },
    args:
      yarnExists || npmCommand != "start" ? ["run", npmCommand] : [npmCommand],
    urlRegexp: new RegExp(`(http://)([^:]+:)${3000}(/)?`, "g"),
    dist: "dist"
  };
};
