import { Router } from "express";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../db";
import { BCRYPT_ROUNDS } from "../config";
import { authenticate, allowRoles } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { averageOf } from "../utils/rating";
import { getSort, getString } from "../utils/query";
import { createStoreSchema, createUserSchema } from "../utils/validation";

const router = Router();
router.use(authenticate, allowRoles("ADMIN"));

const ROLES: Role[] = ["ADMIN", "USER", "STORE_OWNER"];

router.get(
  "/metrics",
  asyncHandler(async (_req, res) => {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const search = getString(req.query.search);
    const role = ROLES.find((r) => r === req.query.role);
    const { sortBy, order } = getSort(req, ["name", "email", "address", "role"], "name");

    const where: Prisma.UserWhereInput = {
      role,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      include: {
        ownedStore: { select: { name: true, ratings: { select: { score: true } } } },
      },
    });

    res.json({
      users: users.map(({ passwordHash, ownedStore, ...user }) => ({
        ...user,
        storeName: ownedStore?.name ?? null,
        // only meaningful for store owners
        storeRating: ownedStore ? averageOf(ownedStore.ratings) : null,
      })),
    });
  })
);

router.post(
  "/users",
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { password, ...data } = req.body;

    if (await prisma.user.findUnique({ where: { email: data.email } })) {
      res.status(409).json({ message: "Email is already registered" });
      return;
    }

    const { passwordHash, ...user } = await prisma.user.create({
      data: { ...data, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
    });

    res.status(201).json({ message: "User created", user });
  })
);

router.get(
  "/stores",
  asyncHandler(async (req, res) => {
    const search = getString(req.query.search);
    const { sortBy, order } = getSort(req, ["name", "email", "address", "rating"], "name");

    const stores = await prisma.store.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      // rating is computed, so it gets sorted below instead
      orderBy: sortBy === "rating" ? undefined : { [sortBy]: order },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { score: true } },
      },
    });

    const result = stores.map(({ ratings, ...store }) => ({
      ...store,
      averageRating: averageOf(ratings),
      totalRatings: ratings.length,
    }));

    if (sortBy === "rating") {
      result.sort((a, b) =>
        order === "asc" ? a.averageRating - b.averageRating : b.averageRating - a.averageRating
      );
    }

    res.json({ stores: result });
  })
);

router.post(
  "/stores",
  validate(createStoreSchema),
  asyncHandler(async (req, res) => {
    const { name, email, address, ownerId } = req.body;

    if (await prisma.store.findUnique({ where: { email } })) {
      res.status(409).json({ message: "A store with this email already exists" });
      return;
    }

    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
        include: { ownedStore: true },
      });
      if (!owner || owner.role !== "STORE_OWNER") {
        res.status(400).json({ message: "Owner must be an existing store owner" });
        return;
      }
      if (owner.ownedStore) {
        res.status(400).json({ message: "This owner already has a store" });
        return;
      }
    }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId: ownerId ?? null },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({
      message: "Store created",
      store: { ...store, averageRating: 0, totalRatings: 0 },
    });
  })
);

export default router;
