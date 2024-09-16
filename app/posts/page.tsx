"use client";

import { Header } from "./Header";
import { useEffect, useState } from "react";
import {
  AUTH_STATE,
  AuthState,
  getCurrentUser,
  User,
  CurrentUser,
} from "@/app/lib/users";
import { useRouter } from "next/navigation";
import { MainContent } from "@/app/ui/MainContent";
import { PleaseVerifyEmail } from "@/app/posts/PleaseVerifyEmail";
import { PleaseRegisterProfile } from "@/app/posts/PleaseRegisterProfile";
import { Posts } from "@/app/posts/Posts";

export default function PostsPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    authState: AUTH_STATE.LOGGED_OUT,
  });

  useEffect(() => {
    if (currentUser.authState !== AUTH_STATE.LOGGED_OUT) return;

    getCurrentUser().then((authStateWithUser) => {
      if (authStateWithUser.authState === AUTH_STATE.LOGGED_OUT) {
        router.replace("/");
        return;
      }

      setCurrentUser(authStateWithUser);
    });
  }, [currentUser, router]);

  return (
    <>
      <Header />
      <MainContent>
        {currentUser.authState === AUTH_STATE.HAS_NOT_VERIFIED_EMAIL && (
          <PleaseVerifyEmail firebaseUser={currentUser.firebaseUser} />
        )}
        {currentUser.authState === AUTH_STATE.HAS_NOT_REGISTERED_PROFILE && (
          <PleaseRegisterProfile />
        )}
        {currentUser.authState === AUTH_STATE.LOGGED_IN && <Posts />}
      </MainContent>
    </>
  );
}
