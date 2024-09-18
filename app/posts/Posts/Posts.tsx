import commonStyles from "@/app/ui/common.module.css";
import styles from "./Posts.module.css";
import { useEffect, useRef, useState } from "react";
import { addPost, usePosts } from "@/app/lib/posts";
import { format } from "date-fns";

type Props = {
  currentUserId: string;
};

export const Posts = ({ currentUserId }: Props) => {
  const [posts, addPostLocal] = usePosts();

  const postsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const postsElm = postsRef.current;
    if (!postsElm) return;
    postsElm.scrollTop = postsElm.scrollHeight;
  }, [posts]);

  const [text, setText] = useState("");

  const send = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const addedPost = await addPost(currentUserId, text);
    addPostLocal(addedPost);

    setText("");
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
        <textarea
          className={styles.textInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              send();
            }
          }}
        />
        <div className={commonStyles.buttonBox}>
          <button className={commonStyles.button} onClick={send}>
            送信
          </button>
        </div>
      </div>
    </div>
  );
};
