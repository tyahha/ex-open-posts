import commonStyles from "@/app/ui/common.module.css";
import styles from "./Posts.module.css";
import { useEffect, useRef, useState } from "react";
import { Post } from "@/app/lib/posts";
import { format } from "date-fns";

export const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const postsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const postsElm = postsRef.current;
    if (!postsElm) return;
    postsElm.scrollTop = postsElm.scrollHeight;
  }, [posts]);

  const send = () => {
    setPosts((prev) => [
      ...prev,
      {
        text: "初めての投稿のテスト。\n開業文字はそのまま開業してほしい。",
        createdBy: "山田 太郎",
        createdAt: new Date().getTime(),
      },
    ]);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.posts} ref={postsRef}>
        {posts.map(({ text, createdBy, createdAt }, i) => {
          return (
            <div key={i} className={styles.post}>
              <div className={styles.postMeta}>
                <div className={styles.postedBy}>{createdBy}</div>
                <div className={styles.postedAt}>
                  {format(createdAt, "yyyy年MM月dd日 HH:mm:ss")}
                </div>
              </div>
              <div className={styles.postedText}>{text}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.control}>
        <textarea className={styles.textInput} />
        <div className={commonStyles.buttonBox}>
          <button className={commonStyles.button} onClick={send}>
            送信
          </button>
        </div>
      </div>
    </div>
  );
};
