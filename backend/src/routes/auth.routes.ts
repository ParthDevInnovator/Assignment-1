import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { prisma } from "../db";
import { BCRYPT_ROUNDS, JWT_EXPIRES_IN, JWT_SECRET } from "../config";
import { authenticate, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { changePasswordSchema, loginSchema, registerSchema } from "../utils/validation";

const router = Router();

const signToken = (user: User) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

// Shape sent to the client. Never include passwordHash.
const toClientUser = (
  user: User & { ownedStore?: { id: string; name: string; email: string; address: string } | null }
) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  address: user.address,
  role: user.role,
  store: user.ownedStore
    ? {
        id: user.ownedStore.id,
        name: user.ownedStore.name,
        email: user.ownedStore.email,
        address: user.ownedStore.address,
      }
    : null,
});

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, address, password } = req.body;

    if (await prisma.user.findUnique({ where: { email } })) {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        role: "USER",
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      },
    });

    res.status(201).json({ token: signToken(user), user: toClientUser(user) });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { ownedStore: true },
    });

    // Same message for both cases so we don't leak which emails exist
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.json({ token: signToken(user), user: toClientUser(user) });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler<AuthRequest>(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { ownedStore: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user: toClientUser(user) });
  })
);

router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler<AuthRequest>(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) },
    });

    res.json({ message: "Password updated" });
  })
);

export default router;
