"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirestoreAuth } from "@/app/lib/firebase/firebaseConfig";
import Image from "next/image";
import clsx from "clsx";
import styles from "./Header.module.css";

export const Header = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

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
    const auth = getFirestoreAuth();
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
          src="/anonymous.png"
          alt="ユーザーのプロフィール画像"
          width={44}
          height={44}
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
