import * as React from "react";

const commitHash = process.env.COMMIT_HASH;
const commitId = commitHash.slice(0, 8);
const commitURL = `https://github.com/tkesgar/javelin/tree/${commitHash}`;
const version = process.env.VERSION;
const versionURL = `https://github.com/tkesgar/javelin/releases/tag/v${version}`;

export default function CreateBoardPage(): JSX.Element {
  return (
    <footer className="text-center text-muted">
      <a href="https://github.com/tkesgar/javelin">javelin</a>{" "}
      <a href={versionURL}>v{version}</a> (<a href={commitURL}>{commitId}</a>)
    </footer>
  );
}
