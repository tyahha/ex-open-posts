import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

const projectId = "avatars-rules-test";

let testEnv: RulesTestEnvironment;
beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
  });
});
beforeEach(async () => await testEnv.clearStorage());
afterAll(async () => await testEnv.cleanup());

const dummyImage = new ArrayBuffer(1);
const bufView = new Uint8Array(dummyImage);
bufView[0] = 1;

describe("avatars rules test", () => {
  const userId = "userId";
  const anotherUserId = "another-user-id";

  describe("create", () => {
    describe("un authenticated", () => {
      const subject = async () => {
        const storage = testEnv.unauthenticatedContext().storage();
        const ref = storage.ref(`avatars/${userId}/test.png`);
        await ref.put(dummyImage).then();
      };

      it("should fail to create", async () => {
        await assertFails(subject());
      });
    });

    describe("have not verified email", () => {
      const subject = async () => {
        const storage = testEnv.authenticatedContext(userId).storage();
        const ref = storage.ref(`avatars/${userId}/test.png`);
        await ref.put(dummyImage).then();
      };

      it("should fail to create", async () => {
        await assertFails(subject());
      });
    });

    describe("have verified email", () => {
      const subject = async () => {
        const storage = testEnv
          .authenticatedContext(userId, { email_verified: true })
          .storage();
        const ref = storage.ref(`avatars/${userId}/test.png`);
        await ref.put(dummyImage).then();
      };

      it("should success to create", async () => {
        await assertSucceeds(subject());
      });
    });

    describe("have verified email and put other user avatar", () => {
      const subject = async () => {
        const storage = testEnv
          .authenticatedContext(userId, { email_verified: true })
          .storage();
        const ref = storage.ref(`avatars/${anotherUserId}/test.png`);
        await ref.put(dummyImage).then();
      };

      it("should fail to create", async () => {
        await assertFails(subject());
      });
    });
  });

  describe("create", () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const storage = ctx.storage();
        const ref1 = storage.ref(`avatars/${userId}/test.png`);
        await ref1.put(dummyImage).then();
        const ref2 = storage.ref(`avatars/${anotherUserId}/test.png`);
        await ref2.put(dummyImage).then();
      });
    });

    describe("un authenticated", () => {
      const subject = async () => {
        const storage = testEnv.unauthenticatedContext().storage();
        const ref = storage.ref(`avatars/${userId}/test.png`);
        await ref.getDownloadURL();
      };

      it("should fail to get download url", async () => {
        await assertFails(subject());
      });
    });

    describe("have not verified email", () => {
      const subject = async () => {
        const storage = testEnv.authenticatedContext(userId).storage();
        const ref = storage.ref(`avatars/${userId}/test.png`);
        await ref.getDownloadURL();
      };

      it("should fail to get download url", async () => {
        await assertFails(subject());
      });
    });

    describe("have verified email", () => {
      const subject = async () => {
        const storage = testEnv
          .authenticatedContext(userId, { email_verified: true })
          .storage();
        const ref = storage.ref(`avatars/${userId}/test.png`);
        await ref.getDownloadURL();
      };

      it("should success to get download url", async () => {
        await assertSucceeds(subject());
      });
    });

    describe("have verified email and get other user avatar", () => {
      const subject = async () => {
        const storage = testEnv
          .authenticatedContext(userId, { email_verified: true })
          .storage();
        const ref = storage.ref(`avatars/${anotherUserId}/test.png`);
        await ref.getDownloadURL();
      };

      it("should success to get download url", async () => {
        await assertSucceeds(subject());
      });
    });
  });
});
