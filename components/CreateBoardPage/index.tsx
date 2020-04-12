import * as React from "react";
import CreateBoardCard from "../CreateBoardCard";
import styles from "./styles.module.scss";

const commitHash = process.env.COMMIT_HASH;
const commitId = commitHash.slice(0, 8);
const commitURL = `https://github.com/tkesgar/javelin/tree/${commitHash}`;

export default function CreateBoardPage(): JSX.Element {
  return (
    <div className="mx-5 my-5">
      <div className={styles["Container"]}>
        <CreateBoardCard />
        <footer className="text-center text-muted pt-3">
          <a href="https://github.com/tkesgar/javelin">javelin</a>(
          <a href={commitURL}>{commitId}</a>) is created with ♥ by{" "}
          <a href="https://tkesgar.com">Ted Kesgar</a>
        </footer>
      </div>
    </div>
  );
}
