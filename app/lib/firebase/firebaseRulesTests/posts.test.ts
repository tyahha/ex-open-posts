import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc } from "@firebase/firestore";
import { SeedPost } from "@/app/lib/firebase/types";
import { serverTimestamp } from "@firebase/database";

const projectId = "posts-rules-test";

let testEnv: RulesTestEnvironment;
beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("users rules", () => {
  const userId = "valid-user-id";
  const postId = "valid-post-id";
  const validData: SeedPost = {
    text: "sample text",
    createdBy: userId,
    createdAt: serverTimestamp(),
  };

  describe("create", () => {
    const getAuthenticatedFirestore = async (id: string = userId) =>
      testEnv.authenticatedContext(id, { email_verified: true }).firestore();

    describe("with valid data", () => {
      describe("un authenticated", () => {
        const subject = async () => {
          const firestore = testEnv.unauthenticatedContext().firestore();
          const docRef = await doc(firestore, `/open-posts/${postId}`);
          return setDoc(docRef, validData);
        };

        it("should fail to create", async () => {
          await assertFails(subject());
        });
      });

      describe("have not verified email", () => {
        const subject = async () => {
          const userId = "valid-user-id";
          const firestore = testEnv.authenticatedContext(userId).firestore();
          const docRef = await doc(firestore, `/open-posts/${postId}`);
          return setDoc(docRef, validData);
        };

        it("should fail to create", async () => {
          await assertFails(subject());
        });
      });

      describe("have verified email", () => {
        const subject = async () => {
          const docRef = doc(
            await getAuthenticatedFirestore(),
            `/open-posts/${postId}`,
          );
          return setDoc(docRef, validData);
        };

        it("should success to create", async () => {
          await assertSucceeds(subject());
        });
      });
    });
  });
});
