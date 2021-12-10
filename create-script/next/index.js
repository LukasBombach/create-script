// const { resolve } = require("path");
// const CreateScriptPlugin = require("../webpack/plugin");
const createScriptLoader = require("../webpack/loader");

/** @param {import('next').NextConfig} nextConfig */
module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      /* config.plugins.push(new CreateScriptPlugin());

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config; */

      config.module.rules.unshift({
        test: /(\.jsx?$|\.tsx?$)/i,
        use: [createScriptLoader, options.defaultLoaders.babel],
      });

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
};
