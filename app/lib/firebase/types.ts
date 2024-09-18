import { User } from "@/app/lib/users";
import { Post } from "@/app/lib/posts";
import { Timestamp } from "@firebase/firestore";
import { serverTimestamp } from "@firebase/database";

export type RawUser = Omit<User, "id">;

export type RawPost = Omit<Post, "id" | "createdAt"> & {
  createdAt: Timestamp;
};

export type SeedPost = Omit<RawPost, "createdAt"> & {
  createdAt: ReturnType<typeof serverTimestamp>;
};
