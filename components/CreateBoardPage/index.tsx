import * as React from "react";
import CreateBoardCard from "../CreateBoardCard";
import Footer from "../Footer";

export default function CreateBoardPage(): JSX.Element {
  return (
    <div className="m-5">
      <div className="mx-auto" style={{ maxWidth: "30rem" }}>
        <CreateBoardCard />
        <div className="pt-3">
          <Footer />
        </div>
      </div>
    </div>
  );
}
