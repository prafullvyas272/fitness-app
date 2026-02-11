import bcrypt from "bcrypt";

export const DEFAULT_PASSWORD = "Strong@123";

export const getHashedPassword = async () => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);
  return hash;
};
