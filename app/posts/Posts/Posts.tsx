import commonStyles from "@/app/ui/common.module.css";
import styles from "./Posts.module.css";

export const Posts = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.posts}>
        <div className={styles.post}>
          <div className={styles.postMeta}>
            <div className={styles.postedBy}>山田 太郎</div>
            <div className={styles.postedAt}>2024年9月17日 12:34:50</div>
          </div>
          <div className={styles.postedText}>
            {"初めての投稿のテスト。\n開業文字はそのまま開業してほしい。"}
          </div>
        </div>
      </div>
      <textarea className={styles.textInput} />
      <div className={commonStyles.buttonBox}>
        <button className={commonStyles.button}>送信</button>
      </div>
    </div>
  );
};
