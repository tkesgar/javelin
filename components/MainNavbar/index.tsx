import { signIn, signOut, useAuth } from "@/services/firebase/auth";
import * as React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import style from "./style.module.scss";
import classnames from "classnames";
import Link from "next/link";

export default function MainNavbar(): JSX.Element {
  const auth = useAuth();

  const isAuthReady = auth !== false;

  return (
    <Navbar bg="primary" variant="dark" expand="sm" className="py-2">
      <Link href="/" passHref>
        <Navbar.Brand href="#home">javelin</Navbar.Brand>
      </Link>

      <Navbar.Toggle aria-controls="mainNavbarNav" />

      <Navbar.Collapse id="mainNavbarNav">
        {isAuthReady ? (
          <Nav className="ml-auto">
            {auth ? (
              <NavDropdown
                title={
                  <img
                    src={auth.photoURL}
                    alt={auth.displayName}
                    className={classnames(style.Avatar, "rounded-circle mr-2")}
                  />
                }
                id="userMenu"
                className={style.UserMenu}
                alignRight
              >
                <NavDropdown.ItemText>
                  <div>{auth.displayName}</div>
                  <div style={{ fontSize: "0.75em" }}>{auth.email}</div>
                </NavDropdown.ItemText>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={() => {
                    signOut();
                  }}
                >
                  Log out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link
                onClick={() => {
                  // TODO Handle error (user cancel sign-in)
                  signIn();
                }}
              >
                Log in with Google
              </Nav.Link>
            )}
          </Nav>
        ) : null}
      </Navbar.Collapse>
    </Navbar>
  );
}
