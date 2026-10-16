import "dotenv/config";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to backend/.env");
}

export const PORT = Number(process.env.PORT) || 5000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = "7d";
export const BCRYPT_ROUNDS = 10;
