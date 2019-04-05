// reusable code for netlify dev
// bit of a hasty abstraction but recommended by oclif
const { getAddons } = require("netlify/src/addons");

/**
 * inject environment variables from netlify addons and buildbot
 * into your local dev process.env
 *
 * ```
 * // usage example
 * const { site } = this.netlify
 * if (site.id) {
 *   const accessToken = await this.authenticate()
 *   const addonUrls = await addEnvVariables(site, accessToken)
 *   // addonUrls is only for startProxy in netlify dev:index
 * }
 * ```
 */
async function addEnvVariables(api, site, accessToken) {
  /** from addons */
  const addonUrls = {};
  const addons = await getAddons(site.id, accessToken);
  addons.forEach(addon => {
    addonUrls[addon.slug] = `${addon.config.site_url}/.netlify/${addon.slug}`;
    for (const key in addon.env) {
      process.env[key] = process.env[key] || addon.env[key];
    }
  });

  /** from web UI */
  const apiSite = await api.getSite({ site_id: site.id });
  // TODO: We should move the environment outside of build settings and possibly have a
  // `/api/v1/sites/:site_id/environment` endpoint for it that we can also gate access to
  // In the future and that we could make context dependend
  if (apiSite.build_settings && apiSite.build_settings.env) {
    for (const key in apiSite.build_settings.env) {
      process.env[key] = process.env[key] || apiSite.build_settings.env[key];
    }
  }

  return addonUrls;
}

module.exports = {
  addEnvVariables
};
