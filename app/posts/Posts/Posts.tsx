import commonStyles from "@/app/ui/common.module.css";
import styles from "./Posts.module.css";
import { useEffect, useRef, useState } from "react";
import { addPost, deletePost, usePosts } from "@/app/lib/posts";
import { format } from "date-fns";
import { getUserName, useGetPostedByUser } from "@/app/lib/users";
import { Avatar } from "@/app/posts/Posts/Avatar";
import formStyles from "@/app/ui/form.module.css";
import clsx from "clsx";

type Props = {
  currentUserId: string;
};

const TEXT_LIMIT = 140;

export const Posts = ({ currentUserId }: Props) => {
  const [posts, addPostLocal] = usePosts();

  const postsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const postsElm = postsRef.current;
    if (!postsElm) return;
    postsElm.scrollTop = postsElm.scrollHeight;
  }, [posts]);

  const [text, setText] = useState("");

  const trimmedText = text.trim();
  const isOverLimit = trimmedText.length > TEXT_LIMIT;

  const send = async () => {
    if (!trimmedText || isOverLimit) return;

    const addedPost = await addPost(currentUserId, text);
    addPostLocal(addedPost);

    setText("");
  };

  const getPostedByUser = useGetPostedByUser();

  return (
    <div className={styles.wrapper}>
      <div className={styles.posts} ref={postsRef}>
        {posts.map((post) => {
          const { id, text, createdAt } = post;
          const user = getPostedByUser(post);
          const postedBy = getUserName(user);
          return (
            <div key={id} className={styles.post}>
              <Avatar user={user} />
              <div className={styles.postContent}>
                <div className={styles.postMeta}>
                  <div className={styles.postedBy}>{postedBy}</div>
                  <div className={styles.postedAt}>
                    {format(createdAt, "yyyy年MM月dd日 HH:mm:ss")}
                  </div>
                  {currentUserId === post.createdBy && (
                    <button
                      className={styles.deletePost}
                      onClick={() => deletePost(post)}
                    >
                      削除
                    </button>
                  )}
                </div>
                <div className={styles.postedText}>{text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.control}>
        <div className={styles.textInputWrapper}>
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
          {isOverLimit && (
            <p className={clsx(formStyles.inputError, styles.error)}>
              文章は{TEXT_LIMIT}以内にしてください。
            </p>
          )}
        </div>
        <div className={commonStyles.buttonBox}>
          <button
            className={commonStyles.button}
            onClick={send}
            disabled={isOverLimit}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
};
