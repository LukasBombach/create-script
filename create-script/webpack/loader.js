const { fs: memfs } = require("memfs");

/**
 * This loader will compile and bundle the file it has been called on
 * along with its dependencies and return the outputs as module exporting
 * the compiled source code as a string.
 *
 * Known Caveats:
 *
 *  - The code is being comiled via a child compiler, which uses the
 *    config it gets from the compilation process it is called from.
 *    We are using this to compile TypeScript code to a string of
 *    JavaScript that we put in the head tag separate from our app code
 *    The code will be compiled by the server compilation which
 *    assumes a node env which might be a problem at some point
 *  - The compiled output will not be minified, this seems to be a
 *    problem independent of being called with the next js server
 *    or client config.
 */
module.exports = function createScriptLoader(content, map, meta) {
  const COMPILER_NAME = "CreateScriptCompiler";
  const EntryOptionPlugin = this._compiler.webpack.EntryOptionPlugin;
  const outputOptions = { filename: "output.js" };
  const loaderCallback = this.async();

  const pathToCompile = /createInlineScript\(['"](?<path>.+?)['"]\)/.exec(content)?.groups?.path;

  /**
   * If a file loaded with this compiler does not use createInlineScript
   *  we do mot have to do anything
   */
  if (!pathToCompile) {
    loaderCallback(null, content, map, meta);
    return;
  }

  /**
   * This is important to prevent recursion, otherwise this compiler
   * would spawn another instance of itsself recursively because it is
   * using the same webpack config that will call this loader for this
   * file again
   */
  if (this._compiler.name === COMPILER_NAME) {
    loaderCallback(null, content, map, meta);
    return;
  }

  /**
   * We are creating a child compiler from the current compilation which
   * allows us to independently compile code with the same config as
   * the compilation that the rest of the code is using
   *
   * We are setting the outputFileSystem to memfs which will write the
   * compiled code to the memory instead of the hard disk
   */
  const childCompiler = this._compilation.createChildCompiler(COMPILER_NAME, outputOptions);
  childCompiler.outputFileSystem = memfs;

  /**
   * Because we are inheriting the exact configuration from the parent
   * compilation we need to overwrite the entry file settings and make
   * the child compiler only compile the one file this loader has been
   * called on (and its dependencies (the files it imports))
   */
  EntryOptionPlugin.applyEntryOption(childCompiler, this._compiler.context, {
    child: { import: [this.resourcePath] },
  });

  /**
   * This will start the compilation and call a callback when its done
   * we still need to apply error handling and extract the source code
   * files that webpack generated. There is no way to tell webpack
   * to return its output as a string so we need to take this little
   * extra route
   */
  childCompiler.runAsChild((error, _entries, childCompilation) => {
    const { warnings, errors } = childCompilation.getStats().toJson();
    const source = childCompilation.assets[pathToCompile]?.source();

    childCompilation.chunks.forEach(chunk => {
      chunk.files.forEach(file => {
        childCompilation.deleteAsset(file);
      });
    });

    if (warnings.length) {
      warnings.forEach(warning => console.warn(warning));
    }

    if (error) {
      loaderCallback(error);
      return;
    }

    if (errors.length) {
      loaderCallback(new Error(errors[0].message));
      return;
    }

    if (!source) {
      loaderCallback(new Error("Failed to get source in vanilla extract loader"));
      return;
    }

    childCompiler.close(async error => {
      if (error) {
        loaderCallback(error);
        return;
      }

      // todo this is not minified
      loaderCallback(null, `module.exports = ${JSON.stringify(source)};`);
    });
  });
};
