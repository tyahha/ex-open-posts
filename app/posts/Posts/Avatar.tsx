import { ANONYMOUS_AVATAR, getUserName, User } from "@/app/lib/users";
import Image from "next/image";
import styles from "@/app/posts/Posts/Posts.module.css";

type Props = {
  user: User | undefined;
};

export const Avatar = ({ user }: Props) => {
  return (
    <Image
      src={user?.avatarSrc || ANONYMOUS_AVATAR}
      alt={`${getUserName(user)}さんのプロフィール画像`}
      width={48}
      height={48}
      className={styles.avatar}
    />
  );
};
