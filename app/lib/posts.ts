import { User } from "@/app/lib/users";
import { RawPost, SeedPost } from "@/app/lib/firebase/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "@firebase/firestore";
import { getFirestore } from "@/app/lib/firebase/firebaseConfig";
import { useEffect, useState } from "react";

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

  const addedDocRef = await addDoc(collection(firestore, "open-posts"), post);
  const addedDocSnapshot = await getDoc(addedDocRef);
  return dataToPostForce(addedDocSnapshot);
};

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const addPostLocal = (post: Post) => {
    setPosts((prev) => {
      if (prev.findIndex((p) => p.id === post.id) !== -1) return prev;
      return [...prev, post];
    });
  };

  useEffect(() => {
    const firestore = getFirestore();

    const postsRef = collection(firestore, "open-posts");

    const q = query(postsRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts((prev) => {
        return snapshot.docChanges().reduce<Post[]>(
          (acc, change) => {
            const doc = change.doc;
            if (change.type === "added") {
              if (acc.findIndex((p) => p.id === doc.id) !== -1) return acc;

              const post = dataToPost(doc);
              if (!post) return acc;

              acc.push(post);
              return acc;
            }
            if (change.type === "modified") {
              return acc.map((p) => {
                if (p.id !== doc.id) return p;
                return dataToPost(doc) || p;
              });
            }
            if (change.type === "removed") {
              return acc.filter((p) => p.id !== doc.id);
            }
            return acc;
          },
          [...prev],
        );
      });
    });

    return () => unsubscribe();
  }, []);

  return [posts, addPostLocal] as const;
};

const dataToPost = (snapshot: DocumentSnapshot): Post | undefined => {
  const rawPost = snapshot.data() as RawPost;

  if (!rawPost.createdAt) return;

  return {
    id: snapshot.id,
    text: rawPost.text,
    createdBy: rawPost.createdBy,
    createdAt: rawPost.createdAt.toMillis(),
  };
};

const dataToPostForce = (snapshot: DocumentSnapshot): Post => {
  const rawPost = snapshot.data() as RawPost;

  return {
    id: snapshot.id,
    text: rawPost.text,
    createdBy: rawPost.createdBy,
    createdAt: rawPost.createdAt?.toMillis() || new Date().getTime(),
  };
};

export const deletePost = async (post: Post) => {
  const firestore = getFirestore();
  const docRef = doc(firestore, `open-posts/${post.id}`);
  await deleteDoc(docRef);
};
