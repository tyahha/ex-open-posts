import { User } from "@/app/lib/users";
import { SeedPost } from "@/app/lib/firebase/types";
import { addDoc, collection, serverTimestamp } from "@firebase/firestore";
import { getFirestore } from "@/app/lib/firebase/firebaseConfig";

export type Post = {
  id: string;
  text: string;
  createdBy: User["id"];
  createdAt: number;
};

export const addPost = async (userId: string, text: string) => {
  const post: SeedPost = {
    text,
    createdBy: userId,
    createdAt: serverTimestamp(),
  };

  const firestore = getFirestore();

  await addDoc(collection(firestore, "open-posts"), post);
};
