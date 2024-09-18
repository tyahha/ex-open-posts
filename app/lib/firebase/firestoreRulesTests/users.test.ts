import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { RawUser } from "@/app/lib/firebase/types";
import { GENDER } from "@/app/lib/users";

const projectId = "users-rules-test";

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
  const validData = {
    name: "dummy-name",
    birthDay: "1992-03-05",
    gender: GENDER.MALE,
  } satisfies RawUser;

  describe("create", () => {
    const getAuthenticatedFirestore = async (id: string = userId) =>
      testEnv.authenticatedContext(id, { email_verified: true }).firestore();

    describe("with valid data", () => {
      describe("un authenticated", () => {
        const subject = async () => {
          const firestore = testEnv.unauthenticatedContext().firestore();
          const docRef = await doc(firestore, `/users/dummy-user-id`);
          return setDoc(docRef, validData);
        };

        it("should fail to create", async () => {
          await assertFails(subject());
        });
      });

      describe("authenticated", () => {
        describe("have not verified email", () => {
          const subject = async (data: RawUser = validData) => {
            const userId = "valid-user-id";
            const firestore = testEnv.authenticatedContext(userId).firestore();
            const docRef = await doc(firestore, `/users/${userId}`);
            return setDoc(docRef, data);
          };

          it("should fail to create", async () => {
            await assertFails(subject());
          });
        });

        describe("have verified email", () => {
          const subject = async (data: RawUser = validData) => {
            const docRef = doc(
              await getAuthenticatedFirestore(),
              `/users/${userId}`,
            );
            return setDoc(docRef, data);
          };

          it("should success to create", async () => {
            await assertSucceeds(subject());
          });

          it("should success to create with avatarPath", async () => {
            await assertSucceeds(
              subject({ ...validData, avatarPath: "dummy-avatar-path" }),
            );
          });

          describe.each(Object.values(GENDER))("gender %s", (gender) => {
            it("should success to create", async () => {
              await assertSucceeds(subject({ ...validData, gender }));
            });
          });
        });
      });
    });

    describe("with invalid data", () => {
      const subject = async (data: object) => {
        const docRef = doc(
          await getAuthenticatedFirestore(),
          `/users/${userId}`,
        );
        return setDoc(docRef, data);
      };

      describe("partial data", () => {
        describe("no name", () => {
          it("should fail to create", async () => {
            const { name: _, ...data } = validData;
            await assertFails(subject(data));
          });
        });

        describe("no birthDay", () => {
          it("should fail to create", async () => {
            const { birthDay: _, ...data } = validData;
            await assertFails(subject(data));
          });
        });

        describe("no gender", () => {
          it("should fail to create", async () => {
            const { gender: _, ...data } = validData;
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
            await assertFails(subject({ ...validData, name: 111 }));
          });
        });

        describe("birthDay", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, birthDay: 222 }));
          });
        });

        describe("gender", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, gender: "VALID" }));
          });
        });

        describe("avatarPath", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, avatarPath: 333 }));
          });
        });
      });

      describe("invalid data format or value", () => {
        describe("name is empty", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, name: "" }));
          });
        });

        describe("name is over 100 length", () => {
          it("should fail to create", async () => {
            await assertFails(
              subject({ ...validData, name: Array(101).fill("a") }),
            );
          });
        });

        describe("birthDay is invalid date", () => {
          it("should fail to create", async () => {
            await assertFails(subject({ ...validData, birthDay: "aaa" }));
          });
        });
      });
    });

    describe("create other user's data", () => {
      const subject = async () => {
        const anotherUserId = "another-user-id";
        await getAuthenticatedFirestore(anotherUserId);

        const docRef = doc(
          await getAuthenticatedFirestore(),
          `/users/${anotherUserId}`,
        );
        await setDoc(docRef, validData);
      };

      it("should fail to create", async () => {
        await assertFails(subject());
      });
    });
  });

  describe("read", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const firestore = ctx.firestore();
        const docRef = doc(firestore, `/users/${userId}`);
        await setDoc(docRef, validData);
      });
    });

    it("should fail without authentication", async () => {
      const firestore = testEnv.unauthenticatedContext().firestore();
      const docRef = doc(firestore, `/users/${userId}`);
      await assertFails(getDoc(docRef));
    });

    it("should fail with user with unverified email", async () => {
      const firestore = testEnv.authenticatedContext(userId).firestore();
      const docRef = doc(firestore, `/users/${userId}`);
      await assertFails(getDoc(docRef));
    });

    it("should success with user with verified email", async () => {
      const firestore = testEnv
        .authenticatedContext(userId, { email_verified: true })
        .firestore();
      const docRef = doc(firestore, `/users/${userId}`);
      const data = (await getDoc(docRef)).data();
      expect(data).toEqual(validData);
    });

    it("should success to read another user data with user with verified email", async () => {
      const firestore = testEnv
        .authenticatedContext("another-user-id", { email_verified: true })
        .firestore();
      const docRef = doc(firestore, `/users/${userId}`);
      const data = (await getDoc(docRef)).data();
      expect(data).toEqual(validData);
    });
  });
});
