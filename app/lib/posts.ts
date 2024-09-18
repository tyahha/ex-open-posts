import { User } from "@/app/lib/users";

export type Post = {
  id: string;
  text: string;
  createdBy: User["id"];
  createdAt: number;
};
