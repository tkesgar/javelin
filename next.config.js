const childProcess = require("child_process");
const withSharo = require("@tkesgar/sharo-next");
const package = require("./package.json");

function getCommitHash() {
  return childProcess.execSync("git rev-parse master").toString().trim();
}

function getVersion() {
  return package.version;
}

module.exports = withSharo({
  env: {
    COMMIT_HASH: getCommitHash(),
    VERSION: getVersion(),
  },
});
