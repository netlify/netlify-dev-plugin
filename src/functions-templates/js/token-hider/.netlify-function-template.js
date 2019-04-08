const chalk = require("chalk");
const NETLIFYDEV = `[${chalk.cyan("Netlify Dev")}]`;

module.exports = {
  name: "token-hider",
  description: "Token Hider: access APIs without exposing your API keys",
  async onComplete() {
    console.log(
      `${NETLIFYDEV} ${chalk.yellow(
        "token-hider"
      )} function created from template!`
    );
    console.log(
      `${NETLIFYDEV} note this function requires ${chalk.yellow(
        "API_URL"
      )} and ${chalk.yellow(
        "API_TOKEN"
      )} build environment variables set in your Netlify Site.`
    );

    let siteData = { name: "YOURSITENAMEHERE" };
    try {
      siteData = await this.netlify.api.getSite({
        siteId: this.netlify.site.id
      });
    } catch (e) {
      // silent error, not important
    }
    console.log(
      `${NETLIFYDEV} Set them at: https://app.netlify.com/sites/${
        siteData.name
      }/settings/deploys#build-environment-variables (must have CD setup)`
    );
  }
};
