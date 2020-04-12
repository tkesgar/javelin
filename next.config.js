/* eslint-env node */
const fs = require("fs");
const childProcess = require("child_process");
const withSharo = require("@tkesgar/sharo-next");
const package = require("./package.json");

function getFirebaseConfigJSON() {
  const json =
    process.env.FIREBASE_CONFIG ||
    fs.readFileSync("./firebase.config.json").toString();

  const config = JSON.parse(json);

  return JSON.stringify(config);
}

function getCommitHash() {
  return childProcess.execSync("git rev-parse master").toString().trim();
}

function getVersion() {
  return package.version;
}

module.exports = withSharo({
  env: {
    FIREBASE_CONFIG: getFirebaseConfigJSON(),
    COMMIT_HASH: getCommitHash(),
    VERSION: getVersion(),
  },
});
