import {
  getFirebaseAuth,
  getFirestore,
} from "@/app/lib/firebase/firebaseConfig";
import { doc, getDoc } from "@firebase/firestore";
import { RawUser } from "@/app/lib/firebase/types";
import { User as FirebaseUser } from "firebase/auth";

export const GENDER = <const>{
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};

type Gender = (typeof GENDER)[keyof typeof GENDER];

export type User = {
  id: string;
  name: string;
  birthDay: string;
  gender: Gender;
};

export const AUTH_STATE = <const>{
  LOGGED_OUT: "LOGGED_OUT",
  HAS_NOT_VERIFIED_EMAIL: "HAS_NOT_VERIFIED_EMAIL",
  HAS_NOT_REGISTERED_PROFILE: "HAS_NOT_REGISTERED_PROFILE",
  LOGGED_IN: "LOGGED_IN",
};

export type AuthState = (typeof AUTH_STATE)[keyof typeof AUTH_STATE];

export type CurrentUser =
  | {
      authState: typeof AUTH_STATE.LOGGED_OUT;
    }
  | {
      authState:
        | typeof AUTH_STATE.HAS_NOT_VERIFIED_EMAIL
        | typeof AUTH_STATE.HAS_NOT_REGISTERED_PROFILE;
      firebaseUser: FirebaseUser;
    }
  | {
      authState: typeof AUTH_STATE.LOGGED_IN;
      firebaseUser: FirebaseUser;
      user: User;
    };

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return {
      authState: AUTH_STATE.LOGGED_OUT,
    };
  }

  if (!auth.currentUser.emailVerified) {
    return {
      authState: AUTH_STATE.HAS_NOT_VERIFIED_EMAIL,
      firebaseUser: auth.currentUser,
    };
  }

  const firestore = getFirestore();

  const docRef = doc(firestore, `/users/${auth.currentUser.uid}`);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return {
      authState: AUTH_STATE.HAS_NOT_REGISTERED_PROFILE,
      firebaseUser: auth.currentUser,
    };
  }

  const rawUser = snapshot.data() as RawUser;
  return {
    authState: AUTH_STATE.LOGGED_IN,
    firebaseUser: auth.currentUser,
    user: {
      id: docRef.id,
      ...rawUser,
    },
  };
};
