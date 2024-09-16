"use client";

import commonStyles from "./ui/common.module.css";
import styles from "./page.module.css";
import clsx from "clsx";
import Link from "next/link";
import { MainContent } from "@/app/ui/MainContent";

export default function Home() {
  return (
    <MainContent>
      <h1 className={styles.label}>EX Open Posts</h1>
      <p className={styles.description}>
        ユーザー同士がテキストを共有しあえるサービスです
      </p>
      <div className={commonStyles.buttonBox}>
        <Link
          href="/login"
          className={clsx(commonStyles.button, commonStyles.secondary)}
        >
          ログイン
        </Link>
        <Link href="/sign-up" className={commonStyles.button}>
          新規登録
        </Link>
      </div>
    </MainContent>
  );
}
