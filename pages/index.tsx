import { signIn, signOut, useAuth } from "@/services/firebase/auth";
import * as React from "react";
import { Button, Dropdown } from "react-bootstrap";
import Link from "next/link";
import { LogIn } from "react-feather";

export default function Index(): JSX.Element {
  const auth = useAuth();

  return (
    <>
      {auth !== false ? (
        <div className="position-fixed" style={{ top: "1rem", right: "1rem" }}>
          {auth ? (
            <Dropdown>
              <Dropdown.Toggle
                id="authUserMenu"
                className="d-flex align-items-center"
                variant="outline-primary"
              >
                <div className="d-inline-flex align-items-center">
                  <img
                    src={auth.photoURL}
                    alt={auth.displayName}
                    className="rounded-circle mr-2"
                    style={{ width: "2rem", height: "2rem" }}
                  />
                  <div className="d-none d-md-block text-left mr-2">
                    <div>{auth.displayName}</div>
                    <div style={{ fontSize: "0.75rem" }}>{auth.email}</div>
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu align="right">
                <Dropdown.ItemText className="d-md-none">
                  <div>{auth.displayName}</div>
                  <div style={{ fontSize: "0.75rem" }}>{auth.email}</div>
                </Dropdown.ItemText>
                <Dropdown.Divider className="d-md-none" />
                <Link href="/" passHref>
                  <Dropdown.Item>Home</Dropdown.Item>
                </Link>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => {
                    signOut();
                  }}
                >
                  Log out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                signIn();
              }}
            >
              Log in with Google
            </Button>
          )}
        </div>
      ) : null}
      <h1>Hello world!</h1>
      <p>It works!</p>
    </>
  );
}
