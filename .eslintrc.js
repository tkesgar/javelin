module.exports = {
  extends: "sharo-scripts",
  // Workaround because Jest is not installed
  settings: { jest: { version: 26 } },
};
