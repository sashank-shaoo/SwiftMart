export const jwtCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  signed: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
