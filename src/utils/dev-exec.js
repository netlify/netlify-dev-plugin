// code extracted from /dev/exec.js so we can reuse it in functions templating
// bit of a hasty abstraction but recommended by oclif
const { getAddons } = require('netlify/src/addons')

/**
 * get this data from the `this.netlify` instance in your commands
 *
 * ```
 * // usage example
 * const { site } = this.netlify
 * if (site.id) {
 *   const accessToken = await this.authenticate()
 *   await addEnvVarsFromAddons(site, accessToken)
 * }
 * ```
 */
export async function addEnvVarsFromAddons(site, accessToken) {
  const addons = await getAddons(site.id, accessToken)
  addons.forEach(addon => {
    for (const key in addon.env) {
      process.env[key] = addon.env[key]
    }
  })
}
