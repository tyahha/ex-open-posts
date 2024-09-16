import styles from "./page.module.css";
import clsx from "clsx";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.label}>EX Open Posts</h1>
        <p className={styles.description}>
          ユーザー同士がテキストを共有しあえるサービスです
        </p>
        <div className={styles.buttonBox}>
          <button className={clsx(styles.button, styles.login)}>
            ログイン
          </button>
          <button className={clsx(styles.button, styles.signUp)}>
            新規登録
          </button>
        </div>
      </div>
    </main>
  );
}
