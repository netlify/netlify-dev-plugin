const chalk = require("chalk");

module.exports = {
  NETLIFYDEV: `${chalk.rgb(40, 180, 170)("Netlify Dev")} ${chalk.greenBright(
    "◈"
  )}`,
  NETLIFYDEVWARN: `${chalk.rgb(40, 180, 170)(
    "Netlify Dev"
  )} ${chalk.yellowBright("◈")}`,
  NETLIFYDEVERR: `${chalk.rgb(40, 180, 170)("Netlify Dev")} ${chalk.redBright(
    "◈"
  )}`
};
