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
  await testEnv.cleanup();
});

describe("users rules", () => {
  describe("create", () => {
    const validData = {
      name: "dummy-name",
      birthDay: "1992-03-05",
      gender: GENDER.MALE,
    } satisfies RawUser;

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
        const subject = async () => {
          const userId = "valid-user-id";
          const firestore = testEnv.authenticatedContext(userId).firestore();
          const docRef = await doc(firestore, `/users/${userId}`);
          return setDoc(docRef, validData);
        };

        it("should success to create", async () => {
          await assertSucceeds(subject());
        });
      });
    });

    describe("with invalid data", () => {
      const subject = async (data: object) => {
        const userId = "valid-user-id";
        const firestore = testEnv.authenticatedContext(userId).firestore();
        const docRef = await doc(firestore, `/users/${userId}`);
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
