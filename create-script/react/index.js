const React = require("react");

module.exports.createInlineScript = function createInlineScript(path) {
  return () => {
    return React.createElement("div", {}, `Path is ${path}`);
  };
};
