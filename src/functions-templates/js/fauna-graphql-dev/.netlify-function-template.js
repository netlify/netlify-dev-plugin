const execa = require("execa");
module.exports = {
  name: "fauna-graphql-dev",
  description: "GraphQL function using Fauna DB [Dev Testing only]",
  addons: [
    {
      addonName: "fauna",
      addonDidInstall(fnPath) {
        require("fs").chmodSync(fnPath + "/sync-schema.js", 0o777);
        execa.sync(fnPath + "/sync-schema.js", undefined, {
          env: process.env,
          stdio: "inherit"
        });
      }
    }
  ],
  onComplete() {
    console.log(`fauna-graphql function created from template!`);
  }
};
