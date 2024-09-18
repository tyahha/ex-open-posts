import {
  getFirebaseAuth,
  getFirestore,
} from "@/app/lib/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { RawUser } from "@/app/lib/firebase/types";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useEffect, useState } from "react";

export const GENDER = <const>{
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};

export type Gender = (typeof GENDER)[keyof typeof GENDER];

export type User = {
  id: string;
  name: string;
  birthDay: string;
  gender: Gender;
};

export const AUTH_STATE = <const>{
  INITIAL: "INITIAL",
  LOGGED_OUT: "LOGGED_OUT",
  HAS_NOT_VERIFIED_EMAIL: "HAS_NOT_VERIFIED_EMAIL",
  HAS_NOT_REGISTERED_PROFILE: "HAS_NOT_REGISTERED_PROFILE",
  LOGGED_IN: "LOGGED_IN",
};

export type AuthState = (typeof AUTH_STATE)[keyof typeof AUTH_STATE];

export type CurrentUser =
  | {
      authState: typeof AUTH_STATE.INITIAL;
    }
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

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    authState: AUTH_STATE.INITIAL,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser({
          authState: AUTH_STATE.LOGGED_OUT,
        });
        return;
      }

      if (!firebaseUser.emailVerified) {
        setCurrentUser({
          authState: AUTH_STATE.HAS_NOT_VERIFIED_EMAIL,
          firebaseUser,
        });
      }

      const firestore = getFirestore();

      const docRef = doc(firestore, `/users/${firebaseUser.uid}`);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        setCurrentUser({
          authState: AUTH_STATE.HAS_NOT_REGISTERED_PROFILE,
          firebaseUser,
        });
      }

      const rawUser = snapshot.data() as RawUser;
      setCurrentUser({
        authState: AUTH_STATE.LOGGED_IN,
        firebaseUser,
        user: {
          id: docRef.id,
          ...rawUser,
        },
      });
    });
  }, []);

  return [currentUser, setCurrentUser] as const;
};

export const registerUser = async (
  id: string,
  rawUser: RawUser,
): Promise<User> => {
  const firestore = getFirestore();

  const docRef = doc(firestore, `/users/${id}`);
  await setDoc(docRef, rawUser);

  return {
    id,
    ...rawUser,
  };
};
