import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc } from "@firebase/firestore";
import { GENDER, RawUser } from "@/app/lib/firebase/types";
import { beforeEach } from "node:test";

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
  describe("create", () => {
    const validData = {
      name: "dummy-name",
      birthDay: "1992-03-05",
      gender: GENDER.MALE,
    } satisfies RawUser;

    const userId = "valid-user-id";
    const getAuthenticatedFirestore = async () =>
      testEnv
        .authenticatedContext(userId, { email_verified: true })
        .firestore();

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
      });
    });
  });
});
