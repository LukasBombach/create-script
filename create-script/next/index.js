const { resolve } = require("path");
const loader = resolve(__dirname, "../webpack/loader");
const CreateScriptPlugin = require("../webpack/plugin");

/** @param {import('next').NextConfig} nextConfig */
module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      // config.plugins.push(new CreateScriptPlugin());

      config.module.rules.unshift({
        test: /(\.jsx?$|\.tsx?$)/i,
        use: [options.defaultLoaders.babel, loader],
      });

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
};
