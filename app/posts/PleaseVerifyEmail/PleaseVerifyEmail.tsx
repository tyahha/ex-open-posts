import commonStyles from "@/app/ui/common.module.css";
import { User } from "@firebase/auth";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "@/app/lib/auth";

type Props = {
  firebaseUser: User;
};

export const PleaseVerifyEmail = ({ firebaseUser }: Props) => {
  const router = useRouter();
  const sendEmailVerifyEmail = async () => {
    await sendEmailVerification(firebaseUser);
    router.replace("/auth/sent-email");
  };

  return (
    <>
      <p>
        メールアドレスの確認ができていません。
        <br />
        メールをご確認ください。
        <br />
        下記より確認メールを再送することができます。
      </p>
      <div className={commonStyles.buttonBox}>
        <button className={commonStyles.button} onClick={sendEmailVerifyEmail}>
          再送する
        </button>
      </div>
    </>
  );
};
