const createHash = require("webpack/lib/util/createHash");
const NullFactory = require("webpack/lib/NullFactory");
const ConstDependency = require("webpack/lib/dependencies/ConstDependency");

const pluginName = "create-script-plugin";
const pkg = require("../package.json");

const VALUE_DEP_MAIN = "CreateScriptPlugin/hash";
const VALUE_DEP_PREFIX = "CreateScriptPlugin/dep";
const IMPORT_TAG = Symbol("CreateScriptPlugin/tag");

class CreateScriptPlugin {
  constructor(options) {
    this.options = options;
  }
  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, compilation => {
      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
      compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

      const mainHash = createHash(compilation.outputOptions.hashFunction);
      mainHash.update(compilation.valueCacheVersions.get(VALUE_DEP_MAIN) || "");
      compilation.valueCacheVersions.set(VALUE_DEP_MAIN, mainHash.digest("hex").slice(0, 8));

      compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
        factory.hooks.parser.for("javascript/auto").tap(pluginName, parser => {
          parser.hooks.importSpecifier.tap(pluginName, (statement, source, id, name) => {
            if (source === `${pkg.name}`) {
              const ids = id === null ? [] : [id];
              parser.tagVariable(name, IMPORT_TAG, {
                name,
                source,
                ids,
                sourceOrder: parser.state.lastHarmonyImportOrder,
                await: statement.await,
              });
              return true;
            }
          });

          parser.hooks.call.for(IMPORT_TAG).tap(pluginName, expression => {
            const path = expression.arguments[0].value;
            const key = `${VALUE_DEP_PREFIX}/${path}`;

            mainHash.update(`|${key}`);
            parser.state.module.buildInfo.valueDependencies.set(key, compilation.valueCacheVersions.get(key));

            const dep = new ConstDependency(JSON.stringify("YADDA YADDA"), expression.range);
            dep.loc = expression.loc;
            parser.state.module.addPresentationalDependency(dep);

            return true;
          });
        });
      });
    });
  }
}

module.exports = CreateScriptPlugin;
