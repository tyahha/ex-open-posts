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
    describe("with valid data", () => {
      const validData = {
        name: "dummy-name",
        birthDay: "1992-03-05",
        gender: GENDER.MALE,
      } satisfies RawUser;

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
  });
});
