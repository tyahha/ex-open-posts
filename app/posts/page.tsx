"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { getFirestoreAuth } from "@/app/lib/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function PostsPage() {
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
    <>
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
    </>
  );
}
