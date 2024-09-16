"use client";

import { Header } from "./Header";
import { useEffect, useState } from "react";
import {
  AUTH_STATE,
  AuthState,
  getCurrentUserWithAuthState,
  User,
} from "@/app/lib/users";
import { useRouter } from "next/navigation";
import { MainContent } from "@/app/ui/MainContent";
import { PleaseVerifyEmail } from "@/app/posts/PleaseVerifyEmail";
import { PleaseRegisterProfile } from "@/app/posts/PleaseRegisterProfile";
import { Posts } from "@/app/posts/Posts";

export default function PostsPage() {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>(AUTH_STATE.LOGGED_OUT);
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  useEffect(() => {
    if (currentUser) return;

    getCurrentUserWithAuthState().then((userWithAuthState) => {
      const authState = userWithAuthState.authState;
      if (authState === AUTH_STATE.LOGGED_OUT) {
        router.replace("/");
        return;
      }

      setAuthState(authState);

      if (authState === AUTH_STATE.LOGGED_IN) {
        setCurrentUser(userWithAuthState.user);
      }
    });
  }, [currentUser, router]);

  return (
    <>
      <Header />
      <MainContent>
        {authState === AUTH_STATE.HAS_NOT_VERIFIED_EMAIL && (
          <PleaseVerifyEmail />
        )}
        {authState === AUTH_STATE.HAS_NOT_REGISTERED_PROFILE && (
          <PleaseRegisterProfile />
        )}
        {authState === AUTH_STATE.LOGGED_IN && <Posts />}
      </MainContent>
    </>
  );
}
