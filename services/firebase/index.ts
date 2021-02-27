import { createDebug } from "@/utils/log";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import JAVELIN_FIREBASE_CONFIG from "./javelin.json";

const debug = createDebug("firebase");

export function initializeApp(): void {
  const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
    ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
    : JAVELIN_FIREBASE_CONFIG;

  firebase.initializeApp(firebaseConfig);
  debug("firebase initialized");
}
