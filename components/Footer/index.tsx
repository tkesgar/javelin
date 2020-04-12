import * as React from "react";

const commitHash = process.env.COMMIT_HASH;
const commitId = commitHash.slice(0, 8);
const commitURL = `https://github.com/tkesgar/javelin/tree/${commitHash}`;

export default function CreateBoardPage(): JSX.Element {
  return (
    <footer className="text-center text-muted">
      <a href="https://github.com/tkesgar/javelin">javelin</a>(
      <a href={commitURL}>{commitId}</a>) is created with ♥ by{" "}
      <a href="https://tkesgar.com">Ted Kesgar</a>
    </footer>
  );
}
