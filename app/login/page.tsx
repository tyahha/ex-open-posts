"use client";

import Link from "next/link";
import { MainContent } from "@/app/ui/MainContent";
import formStyles from "@/app/ui/form.module.css";
import commonStyles from "@/app/ui/common.module.css";
import { typeToFlattenedError, z } from "zod";
import { FormEventHandler, useState } from "react";
import clsx from "clsx";
import { getFirebaseAuth } from "@/app/lib/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/lib/users";

const LoginFormSchema = z.object({
  email: z.string().email("メールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export default function LoginPage() {
  useCurrentUser();

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

  const router = useRouter();

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

    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/posts");
    } catch {
      setLoginError("メールアドレスかパスワードが間違えています。");
    }
  };

  return (
    <MainContent>
      <h1 className={formStyles.label}>EX Open Posts</h1>
      <p className={formStyles.description}>ログインをしましょう！</p>
      <div>
        <form onSubmit={handleSubmit}>
          <div className={formStyles.inputWrapper}>
            <label htmlFor="email" className={formStyles.inputLabel}>
              メールアドレス
            </label>
            <div className={formStyles.inputAndError}>
              <input
                id="email"
                type="email"
                placeholder="メールアドレス"
                className={formStyles.textInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors?.email?.map((error) => (
                <p key={error} className={formStyles.inputError}>
                  {error}
                </p>
              ))}
            </div>
          </div>
          <div className={formStyles.inputWrapper}>
            <label htmlFor="password" className={formStyles.inputLabel}>
              パスワード
            </label>
            <div className={formStyles.inputAndError}>
              <input
                id="password"
                type="password"
                placeholder="パスワード"
                className={formStyles.textInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors?.password?.map((error) => (
                <p key={error} className={formStyles.inputError}>
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
          {loginError && (
            <p className={clsx(formStyles.inputError, formStyles.center)}>
              {loginError}
            </p>
          )}
          <p className={formStyles.notification}>
            ユーザー登録は
            <Link className={formStyles.link} href="/sign-up">
              こちら
            </Link>
            から。
          </p>
        </form>
      </div>
    </MainContent>
  );
}
