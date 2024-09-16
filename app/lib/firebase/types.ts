import { User } from "@/app/lib/users";

export type RawUser = Omit<User, "id">;
