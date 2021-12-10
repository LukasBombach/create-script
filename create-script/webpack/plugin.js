// const RuntimeGlobals = require("./RuntimeGlobals");
const NullFactory = require("webpack/lib/NullFactory");
const ConstDependency = require("webpack/lib/dependencies/ConstDependency");

const pluginName = "create-script-plugin";
const pkg = require("../package.json");

const VALUE_DEP_PREFIX = "CreateScriptPlugin/prefix/";
const IMPORT_TAG = Symbol("CreateScriptPlugin/tag");

function toConstantDependency(parser, value, runtimeRequirements) {
  return function constDependency(expr) {
    const dep = new ConstDependency(value, expr.range, runtimeRequirements);
    dep.loc = expr.loc;
    parser.state.module.addPresentationalDependency(dep);
    return true;
  };
}

class CreateScriptPlugin {
  constructor(options) {
    this.options = options;
  }
  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, compilation => {
      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
      compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
    });

    compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
      factory.hooks.parser.for("javascript/auto").tap(pluginName, parser => {
        // const addValueDependency = key => {
        //   const { buildInfo } = parser.state.module;
        //   buildInfo.valueDependencies.set(
        //     VALUE_DEP_PREFIX + key,
        //     compilation.valueCacheVersions.get(VALUE_DEP_PREFIX + key)
        //   );
        // };

        parser.hooks.importSpecifier.tap(pluginName, (statement, source, id, name) => {
          if (source === `${pkg.name}/react`) {
            const ids = id === null ? [] : [id];
            parser.tagVariable(name, IMPORT_TAG, {
              name,
              source,
              ids,
              sourceOrder: parser.state.lastHarmonyImportOrder,
              await: statement.await,
            });
            // return true;
          }
        });

        parser.hooks.evaluateIdentifier.for(IMPORT_TAG).tap(pluginName, expression => {
          console.log(expression);
          debugger;

          /* // addValueDependency("createInlineScript");

          const strCode = "alert";

          if (/__webpack_require__\s*(!?\.)/.test(strCode)) {
            return toConstantDependency(parser, strCode, [RuntimeGlobals.require])(expression);
          } else if (/__webpack_require__/.test(strCode)) {
            return toConstantDependency(parser, strCode, [RuntimeGlobals.requireScope])(expression);
          } else {
            return toConstantDependency(parser, strCode)(expression);
          } */
        });
      });
    });
  }
}

module.exports = CreateScriptPlugin;
