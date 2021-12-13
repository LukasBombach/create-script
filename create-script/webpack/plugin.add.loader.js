const pluginName = "create-script-plugin";

class CreateScriptPlugin {
  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, compilation => {
      compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
        factory.hooks.parser.for("javascript/auto").tap(pluginName, parser => {
          parser.hooks.program.tap(pluginName, (ast, comments) => {
            debugger;
          });
        });
      });
    });
  }
}

module.exports = CreateScriptPlugin;
