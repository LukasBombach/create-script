const CreateScriptPlugin = require("../webpack/plugin");

/** @param {import('next').NextConfig} nextConfig */
module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.plugins.push(new CreateScriptPlugin());

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
};
