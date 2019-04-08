const chalk = require("chalk");
const NETLIFYDEV = `[${chalk.cyan("Netlify Dev")}]`;

module.exports = {
  name: "stripe-charge",
  description: "Stripe Charge: Charge a user with Stripe",
  async onComplete() {
    console.log(
      `${NETLIFYDEV} ${chalk.yellow(
        "stripe-charge"
      )} function created from template!`
    );
    console.log(
      `${NETLIFYDEV} note this function requires ${chalk.yellow(
        "STRIPE_SECRET_KEY"
      )} build environment variable set in your Netlify Site.`
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
      `${NETLIFYDEV} Set it at: https://app.netlify.com/sites/${
        siteData.name
      }/settings/deploys#build-environment-variables (must have CD setup)`
    );
  }
};
