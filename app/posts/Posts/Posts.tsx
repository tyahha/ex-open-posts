import commonStyles from "@/app/ui/common.module.css";
import styles from "./Posts.module.css";
import { useEffect, useRef, useState } from "react";
import { addPost, deletePost, usePosts } from "@/app/lib/posts";
import { format } from "date-fns";
import { ANONYMOUS_AVATAR, useGetPostedBy } from "@/app/lib/users";
import Image from "next/image";

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

  const getPostedBy = useGetPostedBy();

  return (
    <div className={styles.wrapper}>
      <div className={styles.posts} ref={postsRef}>
        {posts.map((post) => {
          const { id, text, createdAt } = post;
          const postedBy = getPostedBy(post);
          return (
            <div key={id} className={styles.post}>
              <Image
                src={ANONYMOUS_AVATAR}
                alt={`${postedBy}さんのプロフィール画像`}
                width={48}
                height={48}
                className={styles.avatar}
              />
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
