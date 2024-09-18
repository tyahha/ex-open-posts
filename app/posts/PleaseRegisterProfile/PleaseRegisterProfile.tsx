import { User as FirebaseUser } from "firebase/auth";
import Image from "next/image";
import formStyles from "@/app/ui/form.module.css";
import { FormEventHandler, useMemo, useState } from "react";
import { typeToFlattenedError, z } from "zod";
import { GENDER, registerUser, User, Gender } from "@/app/lib/users";
import commonStyles from "@/app/ui/common.module.css";
import clsx from "clsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ja } from "date-fns/locale/ja";
import { format, parse } from "date-fns";
import styles from "./PleaseRegisterProfile.module.css";

registerLocale("ja", ja);

const RegisterProfileFormSchema = z.object({
  name: z
    .string()
    .min(1, "名前を入力してください")
    .max(100, "100文字以内で入力してください"),
  birthDay: z
    .string()
    .regex(
      /^(19|20)[0-9][0-9][-\\/. ](0[1-9]|1[012])[-\\/. ](0[1-9]|[12][0-9]|3[01])$/i,
      "誕生日を入力してください",
    ),
  gender: z.enum([GENDER.MALE, GENDER.FEMALE, GENDER.OTHER], {
    message: "性別を選択してください",
  }),
});

type Props = {
  firebaseUser: FirebaseUser;
  onRegisterUser: (user: User) => void;
};

export const PleaseRegisterProfile = ({
  firebaseUser,
  onRegisterUser,
}: Props) => {
  const [avatar, setAvatar] = useState<File | undefined>();
  const avatarUrl = useMemo(
    () => (avatar ? URL.createObjectURL(avatar) : "/anonymous.png"),
    [avatar],
  );
  const [name, setName] = useState("");
  const [birthDay, setBirthDay] = useState("1990-01-01");
  const [gender, setGender] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    | typeToFlattenedError<{
        name: string;
        birthDay: string;
        gender: string;
      }>["fieldErrors"]
    | undefined
  >();
  const [registerError, setRegisterError] = useState<string | undefined>(
    undefined,
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setFieldErrors(undefined);
    setRegisterError(undefined);

    const result = RegisterProfileFormSchema.safeParse({
      name,
      birthDay,
      gender,
    });

    if (result.error) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      const user = await registerUser(firebaseUser.uid, {
        name,
        birthDay,
        gender: gender as Gender,
      });

      onRegisterUser(user);
    } catch {
      setRegisterError("エラーが発生しました。");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.avatarWrapper}>
        <label htmlFor="avatar" className={styles.avatarLabel}>
          <Image
            src={avatarUrl}
            width={128}
            height={128}
            alt="プロフィール画像"
            className={styles.avatar}
          />
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          className={styles.imageSelection}
          accept="image/png, image/jpeg, image/gif"
          onChange={(e) => {
            if (!e.target.files || e.target.files.length <= 0) return;
            setAvatar(e.target.files[0]);
          }}
        />
      </div>
      <div className={formStyles.inputWrapper}>
        <label htmlFor="name" className={formStyles.inputLabel}>
          名前(表示名)
        </label>
        <div className={formStyles.inputAndError}>
          <input
            id="name"
            type="text"
            placeholder="名前(表示名)"
            className={formStyles.textInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {fieldErrors?.name?.map((error) => (
            <p key={error} className={formStyles.inputError}>
              {error}
            </p>
          ))}
        </div>
      </div>
      <div className={formStyles.inputWrapper}>
        <label htmlFor="birthDay" className={formStyles.inputLabel}>
          誕生日
        </label>
        <div className={formStyles.inputAndError}>
          <DatePicker
            selected={parse(birthDay, "yyyy-MM-dd", new Date())}
            onChange={(date) => {
              if (!date) return;
              setBirthDay(format(date, "yyyy-MM-dd"));
            }}
            id="birthDay"
            className={formStyles.textInput}
            locale="ja"
            dateFormat="yyyy年MM月dd日"
            maxDate={new Date()}
            showYearDropdown
            showMonthDropdown
          />
          {fieldErrors?.birthDay?.map((error) => (
            <p key={error} className={formStyles.inputError}>
              {error}
            </p>
          ))}
        </div>
      </div>
      <div className={formStyles.inputWrapper}>
        <label htmlFor="gender" className={formStyles.inputLabel}>
          性別
        </label>
        <div className={formStyles.inputAndError}>
          <div className={formStyles.radioGroupWrapper}>
            <div className={formStyles.radioWrapper}>
              <input
                id={GENDER.MALE}
                type="radio"
                value={GENDER.MALE}
                checked={gender === GENDER.MALE}
                onChange={(e) => setGender(e.target.value)}
                className={formStyles.radioInput}
              />
              <label htmlFor={GENDER.MALE} className={formStyles.radioLabel}>
                男性
              </label>
            </div>
            <div className={formStyles.radioWrapper}>
              <input
                id={GENDER.FEMALE}
                type="radio"
                value={GENDER.FEMALE}
                checked={gender === GENDER.FEMALE}
                onChange={(e) => setGender(e.target.value)}
                className={formStyles.radioInput}
              />
              <label htmlFor={GENDER.FEMALE} className={formStyles.radioLabel}>
                女性
              </label>
            </div>
            <div className={formStyles.radioWrapper}>
              <input
                id={GENDER.OTHER}
                type="radio"
                value={GENDER.OTHER}
                checked={gender === GENDER.OTHER}
                onChange={(e) => setGender(e.target.value)}
                className={formStyles.radioInput}
              />
              <label htmlFor={GENDER.OTHER} className={formStyles.radioLabel}>
                その他
              </label>
            </div>
          </div>
          {fieldErrors?.gender?.map((error) => (
            <p key={error} className={formStyles.inputError}>
              {error}
            </p>
          ))}
        </div>
      </div>
      <div className={commonStyles.buttonBox}>
        <button type="submit" className={commonStyles.button}>
          新規登録
        </button>
      </div>
      {registerError && (
        <p className={clsx(formStyles.inputError, formStyles.center)}>
          {registerError}
        </p>
      )}
    </form>
  );
};
