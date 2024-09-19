import { User } from "@/app/lib/users";
import { Post } from "@/app/lib/posts";
import { Timestamp } from "@firebase/firestore";
import { serverTimestamp } from "@firebase/firestore";

export type RawUser = Omit<User, "id" | "avatarSrc">;

export type RawPost = Omit<Post, "id" | "createdAt"> & {
  createdAt?: Timestamp;
};

export type SeedPost = Omit<RawPost, "createdAt"> & {
  createdAt: ReturnType<typeof serverTimestamp>;
};
