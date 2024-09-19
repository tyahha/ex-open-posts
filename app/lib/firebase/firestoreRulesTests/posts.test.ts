import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc, Timestamp } from "@firebase/firestore";
import { SeedPost } from "@/app/lib/firebase/types";
import { serverTimestamp } from "@firebase/firestore";

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

    describe("with invalid data", () => {
      const subject = async (data: object) => {
        const docRef = doc(
          await getAuthenticatedFirestore(),
          `/open-posts/${postId}`,
        );
        return setDoc(docRef, data);
      };

      describe("partial data", () => {
        describe("no text", () => {
          it("should fail to create", async () => {
            const { text: _, ...data } = validData;
            await assertFails(subject(data));
          });
        });

        describe("no createBy", () => {
          it("should fail to create", async () => {
            const { createdBy: _, ...data } = validData;
            await assertFails(subject(data));
          });
        });

        describe("no createAt", () => {
          it("should fail to create", async () => {
            const { createdAt: _, ...data } = validData;
            await assertFails(subject(data));
          });
        });
      });

      describe("with extra data", () => {
        it("should fail to create", async () => {
          await assertFails(subject({ ...validData, extraKey: "extra" }));
        });
      });

      describe("invalid data type", () => {
        describe("name", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, text: 111 }));
          });
        });

        describe("birthDay", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, createdBy: 222 }));
          });
        });

        describe("gender", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, createdAt: 333 }));
          });
        });
      });

      describe("invalid data format or value", () => {
        describe("text is empty", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, text: "" }));
          });
        });

        describe("text is over 140 length", () => {
          it("should fail to create", async () => {
            await assertFails(
              subject({ ...validData, text: Array(141).fill("a") }),
            );
          });
        });

        describe("createdBy is another user id", () => {
          it("should fail to create", async () => {
            await assertFails(
              subject({ ...validData, createdBy: "another-user-id" }),
            );
          });
        });

        describe("createdAt is not request time", () => {
          it("should fail to create", async () => {
            await assertFails(
              subject({ ...validData, createdAt: Timestamp.fromMillis(10) }),
            );
          });
        });
      });
    });
  });

  describe("read", () => {
    describe.each([
      {
        description: "own data",
        data: validData,
      },
      {
        description: "other user data",
        data: {
          ...validData,
          createdBy: "another-user-id",
        },
      },
    ])("$description", ({ data }) => {
      beforeEach(async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
          const firestore = ctx.firestore();
          const docRef = doc(firestore, `/open-posts/${postId}`);
          await setDoc(docRef, data);
        });
      });

      it("should fail without authentication", async () => {
        const firestore = testEnv.unauthenticatedContext().firestore();
        const docRef = doc(firestore, `/open-posts/${postId}`);
        await assertFails(getDoc(docRef));
      });

      it("should fail with user with unverified email", async () => {
        const firestore = testEnv.authenticatedContext(userId).firestore();
        const docRef = doc(firestore, `/open-posts/${postId}`);
        await assertFails(getDoc(docRef));
      });

      it("should success with user with verified email", async () => {
        const firestore = testEnv
          .authenticatedContext(userId, { email_verified: true })
          .firestore();
        const docRef = doc(firestore, `/open-posts/${postId}`);
        const retData = (await getDoc(docRef)).data();
        expect(retData).toEqual(
          expect.objectContaining({
            ...data,
            createdAt: expect.any(Object),
          }),
        );
      });
    });
  });

  describe("delete", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const firestore = ctx.firestore();
        const docRef = doc(firestore, `/open-posts/${postId}`);
        await setDoc(docRef, validData);
      });
    });

    it("should fail without authentication", async () => {
      const firestore = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(firestore, `/open-posts/${postId}`);
      await assertFails(deleteDoc(docRef));
    });

    it("should fail with user with unverified email", async () => {
      const firestore = testEnv.authenticatedContext(userId).firestore();
      const docRef = doc(firestore, `/open-posts/${postId}`);
      await assertFails(deleteDoc(docRef));
    });

    it("should success with user with verified email", async () => {
      const firestore = testEnv
        .authenticatedContext(userId, { email_verified: true })
        .firestore();
      const docRef = doc(firestore, `/open-posts/${postId}`);

      const docSnapshotBefore = await getDoc(docRef);
      expect(docSnapshotBefore.exists()).toBeTruthy();

      await assertSucceeds(deleteDoc(docRef));

      const docSnapshotAfter = await getDoc(docRef);
      expect(docSnapshotAfter.exists()).toBeFalsy();
    });

    it("should fail with another user with verified email", async () => {
      const firestore = testEnv
        .authenticatedContext("another-user-id", { email_verified: true })
        .firestore();
      const docRef = doc(firestore, `/open-posts/${postId}`);
      await assertFails(deleteDoc(docRef));
    });
  });
});
