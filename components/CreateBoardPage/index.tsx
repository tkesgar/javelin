import * as React from "react";
import CreateBoardCard from "../CreateBoardCard";
import styles from "./styles.module.scss";

export default function CreateBoardPage(): JSX.Element {
  return (
    <div className="mx-5 my-5">
      <div className={styles["Container"]}>
        <CreateBoardCard />
        <footer className="text-center text-muted pt-3">
          <a href="https://github.com/tkesgar/javelin">javelin</a> is created
          with ♥ by <a href="https://tkesgar.com">Ted Kesgar</a>
        </footer>
      </div>
    </div>
  );
}
