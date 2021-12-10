// const React = require("react");
const { compileToString } = require("create-script");

module.exports.createInlineScript = function createInlineScript(path) {
  console.log("path is", path);
  return path;
  // return () => {
  //   return React.createElement("div", {}, `Path is ${path}`);
  // };
};
