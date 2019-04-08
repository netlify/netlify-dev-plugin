const chalk = require("chalk");
const NETLIFYDEV = `[${chalk.cyan("Netlify Dev")}]`;

module.exports = {
  name: "url-shortener",
  description: "URL Shortener: simple URL shortener with Netlify Forms!",
  async onComplete() {
    console.log(
      `${NETLIFYDEV} ${chalk.yellow(
        "url-shortener"
      )} function created from template!`
    );
    console.log(
      `${NETLIFYDEV} note this function requires ${chalk.yellow(
        "ROUTES_FORM_ID"
      )} and ${chalk.yellow(
        "API_AUTH"
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
