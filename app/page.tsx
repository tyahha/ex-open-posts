import commonStyles from "./ui/common.module.css";
import styles from "./page.module.css";
import clsx from "clsx";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={commonStyles.content}>
        <h1 className={styles.label}>EX Open Posts</h1>
        <p className={styles.description}>
          ユーザー同士がテキストを共有しあえるサービスです
        </p>
        <div className={styles.buttonBox}>
          <Link
            href="/login"
            className={clsx(commonStyles.button, commonStyles.login)}
          >
            ログイン
          </Link>
          <Link
            href="/sign-up"
            className={clsx(commonStyles.button, commonStyles.signUp)}
          >
            新規登録
          </Link>
        </div>
      </div>
    </main>
  );
}
