"use client";

import Link from "next/link";
import { MainContent } from "@/app/ui/MainContent";
import styles from "./page.module.css";
import commonStyles from "@/app/ui/common.module.css";
import { typeToFlattenedError, z } from "zod";
import { FormEventHandler, useState } from "react";
import clsx from "clsx";

const LoginFormSchema = z.object({
  email: z.string().email("メールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    | typeToFlattenedError<{
        email: string;
        password: string;
      }>["fieldErrors"]
    | undefined
  >();
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setFieldErrors(undefined);
    setLoginError(undefined);

    const result = LoginFormSchema.safeParse({
      email,
      password,
    });

    if (result.error) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    console.log("TODO try to login");
  };

  return (
    <MainContent>
      <h1 className={styles.label}>EX Open Posts</h1>
      <p className={styles.description}>ログインをしましょう！</p>
      <div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <label htmlFor="email" className={styles.inputLabel}>
              メールアドレス
            </label>
            <div className={styles.inputAndError}>
              <input
                id="email"
                type="email"
                placeholder="メールアドレス"
                className={styles.textInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors?.email?.map((error) => (
                <p key={error} className={styles.inputError}>
                  {error}
                </p>
              ))}
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="password" className={styles.inputLabel}>
              パスワード
            </label>
            <div className={styles.inputAndError}>
              <input
                id="password"
                type="password"
                placeholder="パスワード"
                className={styles.textInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors?.password?.map((error) => (
                <p key={error} className={styles.inputError}>
                  {error}
                </p>
              ))}
            </div>
          </div>
          <div className={commonStyles.buttonBox}>
            <button type="submit" className={commonStyles.button}>
              ログイン
            </button>
            <Link
              href="/"
              className={clsx(commonStyles.button, commonStyles.secondary)}
            >
              キャンセル
            </Link>
          </div>
          <p className={styles.notification}>
            ユーザー登録は
            <Link className={styles.link} href="/sign-up">
              こちら
            </Link>
            から。
          </p>
          {loginError && <p className={styles.inputError}>{loginError}</p>}
        </form>
      </div>
    </MainContent>
  );
}
