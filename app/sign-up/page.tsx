import Link from "next/link";
import commonStyles from "@/app/ui/common.module.css";
import styles from "./page.module.css";
import clsx from "clsx";
import { MainContent } from "@/app/ui/MainContent";

export default function LoginPage() {
  return (
    <MainContent>
      <h1 className={styles.label}>EX Open Posts</h1>
      <p className={styles.description}>新規登録をしましょう！</p>
      <form>
        <div className={styles.inputWrapper}>
          <label htmlFor="email" className={styles.inputLabel}>
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            placeholder="メールアドレス"
            required
            className={styles.textInput}
          />
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="password" className={styles.inputLabel}>
            パスワード
          </label>
          <input
            id="password"
            type="password"
            placeholder="パスワード"
            required
            className={styles.textInput}
          />
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="reinputPassword" className={styles.inputLabel}>
            パスワード(再入力)
          </label>
          <input
            id="reinputPassword"
            type="password"
            placeholder="パスワード(再入力)"
            required
            className={styles.textInput}
          />
        </div>
        <div className={commonStyles.buttonBox}>
          <Link href="/" className={commonStyles.button}>
            新規登録
          </Link>
          <Link
            href="/"
            className={clsx(commonStyles.button, commonStyles.secondary)}
          >
            キャンセル
          </Link>
        </div>
      </form>
    </MainContent>
  );
}
