import * as React from "react";
import firebase from "firebase/app";

interface Auth {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

const AuthContext = React.createContext<false | Auth>(false);

function createAuth(user: firebase.User) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [auth, setAuth] = React.useState<false | Auth>(false);

  React.useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setAuth(user ? createAuth(user) : null);
    });

    return () => {
      unsubscribe();
      setAuth(false);
    };
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): false | Auth {
  return React.useContext(AuthContext);
}

export function useAuthorize(
  authorize = (auth: Auth) => Boolean(auth)
): boolean {
  const auth = useAuth();

  return auth === false ? null : Boolean(auth) && authorize(auth);
}

export async function signIn(): Promise<Auth> {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("email");

  const credential = await firebase.auth().signInWithPopup(provider);
  return createAuth(credential.user);
}

export async function signOut(): Promise<void> {
  await firebase.auth().signOut();
}
