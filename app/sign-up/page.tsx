"use client";

import Link from "next/link";
import commonStyles from "@/app/ui/common.module.css";
import formStyles from "@/app/ui/form.module.css";
import clsx from "clsx";
import { MainContent } from "@/app/ui/MainContent";
import { getFirebaseAuth } from "@/app/lib/firebase/firebaseConfig";
import { FormEventHandler, useState } from "react";
import { z, typeToFlattenedError } from "zod";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "@/app/lib/auth";

const SignUpFormSchema = z
  .object({
    email: z.string().email("メールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .regex(
        /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,100}$/i,
        "パスワードは半角英数字混合で入力してください",
      ),
    reInputPassword: z.string().min(1, "確認用のパスワードを入力してください"),
  })
  .superRefine(({ password, reInputPassword }, ctx) => {
    if (password !== reInputPassword) {
      ctx.addIssue({
        path: ["reInputPassword"],
        code: "custom",
        message: "パスワードが一致しません",
      });
    }
  });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reInputPassword, setReInputPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    | typeToFlattenedError<{
        email: string;
        password: string;
        reInputPassword: string;
      }>["fieldErrors"]
    | undefined
  >();
  const [signUpError, setSignUpError] = useState<string | undefined>(undefined);

  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setFieldErrors(undefined);
    setSignUpError(undefined);

    const result = SignUpFormSchema.safeParse({
      email,
      password,
      reInputPassword,
    });

    if (result.error) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await sendEmailVerification(userCredential.user);

      router.replace("/auth/sent-email");
    } catch (e) {
      // NOTE: ２重登録の対応度などはスコープ外とさせていただきます。
      setSignUpError("エラーが発生しました");
    }
  };

  return (
    <MainContent>
      <h1 className={formStyles.label}>EX Open Posts</h1>
      <p className={formStyles.description}>新規登録をしましょう！</p>
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
        <div className={formStyles.inputWrapper}>
          <label htmlFor="reinputPassword" className={formStyles.inputLabel}>
            パスワード(再入力)
          </label>
          <div className={formStyles.inputAndError}>
            <input
              id="reinputPassword"
              type="password"
              placeholder="パスワード(再入力)"
              className={formStyles.textInput}
              value={reInputPassword}
              onChange={(e) => setReInputPassword(e.target.value)}
            />
            {fieldErrors?.reInputPassword?.map((error) => (
              <p key={error} className={formStyles.inputError}>
                {error}
              </p>
            ))}
          </div>
        </div>
        <p className={formStyles.notification}>
          <a
            className={formStyles.link}
            href="https://luna-matching.notion.site/a714620bbd8740d1ac98f2326fbd0bbc"
            target="_blank"
          >
            利用規約
          </a>
          の確認をお願いいたします。
          <br />
          登録をした場合、利用規約に同意したものとします。
        </p>
        <div className={commonStyles.buttonBox}>
          <button type="submit" className={commonStyles.button}>
            新規登録
          </button>
          <Link
            href="/"
            className={clsx(commonStyles.button, commonStyles.secondary)}
          >
            キャンセル
          </Link>
        </div>
        {signUpError && (
          <p className={clsx(formStyles.inputError, formStyles.center)}>
            {signUpError}
          </p>
        )}
      </form>
    </MainContent>
  );
}
