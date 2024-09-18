import {
  getFirebaseAuth,
  getFirestore,
  getStorage,
} from "@/app/lib/firebase/firebaseConfig";
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  query,
  setDoc,
} from "@firebase/firestore";
import { RawUser } from "@/app/lib/firebase/types";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { Post } from "@/app/lib/posts";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";

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
  avatarPath?: string;
};

export const ANONYMOUS_AVATAR = "/anonymous.png";

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
        return;
      }

      const firestore = getFirestore();

      const docRef = doc(firestore, `/users/${firebaseUser.uid}`);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        setCurrentUser({
          authState: AUTH_STATE.HAS_NOT_REGISTERED_PROFILE,
          firebaseUser,
        });
        return;
      }

      setCurrentUser({
        authState: AUTH_STATE.LOGGED_IN,
        firebaseUser,
        user: rawToUser(snapshot),
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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(getFirestore(), "users")),
      (snapshot) => {
        setUsers((prev) => {
          return snapshot.docChanges().reduce<User[]>(
            (acc, change) => {
              const doc = change.doc;
              if (change.type === "added") {
                if (acc.findIndex((p) => p.id === doc.id) !== -1) return acc;
                acc.push(rawToUser(doc));
                return acc;
              }
              if (change.type === "modified") {
                return acc.map((p) => {
                  if (p.id !== doc.id) return p;
                  return rawToUser(doc);
                });
              }
              if (change.type === "removed") {
                return acc.filter((p) => p.id === doc.id);
              }
              return acc;
            },
            [...prev],
          );
        });
      },
    );

    return () => unsubscribe();
  }, []);

  return users;
};

const rawToUser = (snapshot: DocumentSnapshot): User => {
  const rawUser = snapshot.data() as RawUser;

  return {
    id: snapshot.id,
    ...rawUser,
  };
};

export const useGetPostedByUser = () => {
  const users = useUsers();

  return useCallback(
    (post: Post) => {
      return users.find((u) => u.id === post.createdBy);
    },
    [users],
  );
};

export const getUserName = (user: User | undefined) =>
  user ? user.name : "不明なユーザー";

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<string> => {
  const storage = getStorage();
  const ext = file.name.split(".").pop();
  const path = `avatars/${userId}/${userId}.${ext}`;
  await uploadBytes(ref(storage, path), file);
  return path;
};

export const getAvatarSrc = async (user: User) => {
  if (!user.avatarPath) return ANONYMOUS_AVATAR;

  return getDownloadURL(ref(getStorage(), user.avatarPath));
};

export const getAvatarSrcFromCurrentUser = async (currentUser: CurrentUser) => {
  if (currentUser.authState !== AUTH_STATE.LOGGED_IN) return ANONYMOUS_AVATAR;

  return getAvatarSrc(currentUser.user);
};
