import { MainContent } from "@/app/ui/MainContent";
import commonStyles from "@/app/ui/common.module.css";
import Link from "next/link";

export default function SentEmailPage() {
  return (
    <MainContent>
      メールアドレス確認のためのメールを送信しました。
      <br />
      メールを確認して登録を完了してください。
      <div className={commonStyles.buttonBox}>
        <Link href="/login" className={commonStyles.button}>
          ログイン画面に進む
        </Link>
      </div>
    </MainContent>
  );
}
