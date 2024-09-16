import {
  sendEmailVerification as sendEmailVerificationRaw,
  User,
} from "@firebase/auth";

export const sendEmailVerification = (user: User) =>
  sendEmailVerificationRaw(user, {
    url: `${location.origin}/posts`,
  });
