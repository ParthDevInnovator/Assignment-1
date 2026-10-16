import { z } from "zod";

// 8-16 chars, at least one uppercase letter and one special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const name = z
  .string()
  .trim()
  .min(20, "Name must be at least 20 characters")
  .max(60, "Name must be at most 60 characters");

const email = z.string().trim().toLowerCase().email("Invalid email address");

const address = z
  .string()
  .trim()
  .min(1, "Address is required")
  .max(400, "Address must be at most 400 characters");

const password = z
  .string()
  .regex(
    PASSWORD_REGEX,
    "Password must be 8-16 characters with at least one uppercase letter and one special character"
  );

export const registerSchema = z.object({ name, email, address, password });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: password,
});

export const createUserSchema = registerSchema.extend({
  role: z.enum(["ADMIN", "USER", "STORE_OWNER"]).default("USER"),
});

export const createStoreSchema = z.object({
  name: z.string().trim().min(3, "Store name is too short").max(100),
  email,
  address,
  ownerId: z.string().uuid().nullish(),
});

export const ratingSchema = z.object({
  storeId: z.string().uuid("Invalid store id"),
  score: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
});
