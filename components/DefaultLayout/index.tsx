import * as React from "react";
import MainNavbar from "../MainNavbar";

export default function DefaultLayout({
  children,
}: {
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <>
      <MainNavbar />
      {children}
    </>
  );
}
