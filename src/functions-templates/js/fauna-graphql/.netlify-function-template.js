const execa = require("execa");
module.exports = {
  name: "fauna-graphql",
  description: "GraphQL function using Fauna DB [Public Beta]",
  addons: [
    {
      addonName: "fauna",
      addonDidInstall(fnPath) {
        execa.sync(fnPath + "/sync-schema.js", undefined, {
          env: process.env,
          stdio: "inherit"
        });
      }
    }
  ]
};
