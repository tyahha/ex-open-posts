import {
  ANONYMOUS_AVATAR,
  getAvatarSrc,
  getUserName,
  User,
} from "@/app/lib/users";
import Image from "next/image";
import styles from "@/app/posts/Posts/Posts.module.css";
import { useEffect, useState } from "react";

type Props = {
  user: User | undefined;
};

export const Avatar = ({ user }: Props) => {
  const [avatarSrc, setAvatarSrc] = useState(ANONYMOUS_AVATAR);
  useEffect(() => {
    if (!user) {
      setAvatarSrc(ANONYMOUS_AVATAR);
      return;
    }
    getAvatarSrc(user).then(setAvatarSrc);
  }, [user]);

  return (
    <Image
      src={avatarSrc}
      alt={`${getUserName(user)}さんのプロフィール画像`}
      width={48}
      height={48}
      className={styles.avatar}
    />
  );
};
