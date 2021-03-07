const childProcess = require("child_process");
const sharoNext = require("@tkesgar/sharo-next");
const package = require("./package.json");

const withSharo = sharoNext();

function getCommitHash() {
  return childProcess.execSync("git rev-parse HEAD").toString().trim();
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
