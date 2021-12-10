const { fs: memfs } = require("memfs");

module.exports = function compile(compilation, compiler, path) {
  return new Promise((resolve, reject) => {
    const COMPILER_NAME = "Create Script Compiler";
    const EntryOptionPlugin = compiler.webpack.EntryOptionPlugin;
    const outputOptions = { filename: "output.js" };

    if (compiler.name === COMPILER_NAME) {
      loaderCallback(null, content, map, meta);
      return;
    }

    const childCompiler = compilation.createChildCompiler(COMPILER_NAME, outputOptions);
    childCompiler.outputFileSystem = memfs;

    EntryOptionPlugin.applyEntryOption(childCompiler, compiler.context, {
      child: { import: [path] },
    });

    childCompiler.runAsChild((error, _entries, childCompilation) => {
      const { warnings, errors } = childCompilation.getStats().toJson();
      const source = childCompilation.assets[outputOptions.filename]?.source();

      if (warnings.length) {
        warnings.forEach(warning => console.warn(warning));
      }

      if (error) {
        reject(error);
        return;
      }

      if (errors.length) {
        reject(new Error(errors[0].message));
        return;
      }

      if (!source) {
        reject(new Error("Failed to get source in vanilla extract loader"));
        return;
      }

      childCompiler.close(async error => {
        if (error) {
          reject(error);
        } else {
          resolve(source);
        }
      });
    });
  });
};
