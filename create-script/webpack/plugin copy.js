const NullFactory = require("webpack/lib/NullFactory");
const ConstDependency = require("webpack/lib/dependencies/ConstDependency");

const pluginName = "create-script-plugin";
const pkg = require("../package.json");

const createInlineScriptTag = Symbol("createInlineScript import");

class CreateScriptPlugin {
  constructor(options) {
    this.options = options;
  }
  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    compiler.hooks.compilation.tap(
      pluginName,
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(ConstDependency, new NullFactory());

        compilation.dependencyTemplates.set(
          ConstDependency,
          new ConstDependency.Template()
        );

        normalModuleFactory.tap(pluginName, factory => {
          factory.hooks.parser
            .for("javascript/auto")
            .tap(pluginName, (parser, options) => {
              parser.hooks.importSpecifier.tap(
                pluginName,
                (statement, source, id, name) => {
                  if (source === `${pkg.name}/react`) {
                    const ids = id === null ? [] : [id];
                    parser.tagVariable(name, createInlineScriptTag, {
                      name,
                      source,
                      ids,
                      sourceOrder: parser.state.lastHarmonyImportOrder,
                      await: statement.await,
                    });
                    return true;
                  }
                }
              );

              parser.hooks.expression
                .for(createInlineScriptTag)
                .tap(pluginName, expression => {
                  console.log(expression);
                  debugger;
                  return "expressionResult";
                });

              // parser.hooks.expression
              //   .for(createInlineScriptTag)
              //   .tap(pluginName, expr => {
              //     console.log(expr);
              //     debugger;
              //   });

              // parser.hooks.call
              //   .for("createInlineScript")
              //   .tap(pluginName, expression => {
              //     console.log("createInlineScript", expression);
              //     debugger;
              //   });
            });
        });
      }
    );
  }
}

module.exports = CreateScriptPlugin;
