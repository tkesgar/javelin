import { signOut, useAuth } from "@/services/firebase/auth";
import * as React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import style from "./style.module.scss";
import classnames from "classnames";
import Link from "next/link";

export default function MainNavbar(): JSX.Element {
  const auth = useAuth();

  return (
    <Navbar bg="primary" variant="dark" className="py-2">
      <Link href="/" passHref>
        <Navbar.Brand href="#home">javelin</Navbar.Brand>
      </Link>

      {auth ? (
        <Nav className="ml-auto">
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
        </Nav>
      ) : null}
    </Navbar>
  );
}
