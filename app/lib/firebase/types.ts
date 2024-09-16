export const GENDER = <const>{
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};

type Gender = (typeof GENDER)[keyof typeof GENDER];

export type RawUser = {
  name: string;
  birthDay: string;
  gender: Gender;
};
