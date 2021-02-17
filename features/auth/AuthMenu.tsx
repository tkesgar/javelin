import { signIn, signOut, useAuth } from "@/services/firebase/auth";
import * as React from "react";
import { Button, Dropdown } from "react-bootstrap";
import Link from "next/link";

export default function AuthMenu(): JSX.Element {
  const auth = useAuth();

  if (auth === false) {
    return null;
  }

  return (
    <div className="Container">
      <style jsx>{`
        .Container {
          position: fixed;
          top: 1rem;
          right: 1rem;
        }

        .Avatar {
          width: 2rem;
          height: 2rem;
        }

        .UserEmail {
          font-size: 0.75em;
        }
      `}</style>
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
                className="Avatar rounded-circle mr-2"
              />
              <div className="d-none d-md-block text-left mr-2">
                <div>{auth.displayName}</div>
                <div className="UserEmail">{auth.email}</div>
              </div>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu align="right">
            <Dropdown.ItemText className="d-md-none">
              <div>{auth.displayName}</div>
              <div className="UserEmail">{auth.email}</div>
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
  );
}
