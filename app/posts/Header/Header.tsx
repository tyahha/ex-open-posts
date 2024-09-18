"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/app/lib/firebase/firebaseConfig";
import Image from "next/image";
import clsx from "clsx";
import styles from "./Header.module.css";
import {
  ANONYMOUS_AVATAR,
  CurrentUser,
  getAvatarSrcFromCurrentUser,
} from "@/app/lib/users";

type Props = {
  currentUser?: CurrentUser;
};

export const Header = ({ currentUser }: Props) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const [avatarSrc, setAvatarSrc] = useState(ANONYMOUS_AVATAR);
  useEffect(() => {
    if (!currentUser) {
      setAvatarSrc(ANONYMOUS_AVATAR);
      return;
    }
    getAvatarSrcFromCurrentUser(currentUser).then(setAvatarSrc);
  }, [currentUser]);

  useEffect(() => {
    const handler = (e: Event) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(`.${styles.profileMenuButton}`)
      ) {
        return;
      }
      setIsOpenMenu(false);
    };
    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, []);

  const router = useRouter();

  const logout = async () => {
    const auth = getFirebaseAuth();
    await auth.signOut();
    router.replace("/");
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.appName}>EX Open Poster</h1>
      <button
        className={styles.profileMenuButton}
        onClick={() => setIsOpenMenu(true)}
      >
        <Image
          src={avatarSrc}
          alt="ユーザーのプロフィール画像"
          width={44}
          height={44}
          className={styles.avatar}
        />
      </button>
      <div
        className={clsx(styles.menuBody, {
          [styles.visible]: isOpenMenu,
        })}
      >
        <div className={styles.menuItem} onClick={logout}>
          ログアウト
        </div>
      </div>
    </header>
  );
};
