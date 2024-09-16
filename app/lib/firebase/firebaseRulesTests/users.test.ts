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
  describe("create valid with valid data", () => {
    describe("un authenticated", () => {
      const subject = async () => {
        const firestore = testEnv.unauthenticatedContext().firestore();
        const docRef = await doc(firestore, `/users/dummy-user-id`);
        return setDoc(docRef, {
          name: "dummy-name",
          birthDay: "1992-03-05",
          gender: GENDER.MALE,
        } satisfies RawUser);
      };

      it("should fail to create", async () => {
        await expect(assertFails(subject())).resolves.toBeTruthy();
      });
    });
  });
});
