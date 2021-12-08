const pluginName = "create-script-plugin";

class CreateScriptPlugin {
  constructor(options) {
    this.options = options;
  }
  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    console.log("CreateScriptPlugin apply");

    compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
      factory.hooks.parser
        .for("javascript/auto")
        .tap(pluginName, (parser, options) => {
          console.log(parser, options);
          debugger;
        });
    });
  }
}

module.exports = CreateScriptPlugin;
