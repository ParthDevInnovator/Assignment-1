import { Router } from "express";
import { prisma } from "../db";
import { authenticate, allowRoles, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { averageOf } from "../utils/rating";
import { getSort } from "../utils/query";

const router = Router();
router.use(authenticate, allowRoles("STORE_OWNER"));

const NO_STORE = "No store is assigned to your account yet. Ask an admin to set one up.";

const getOwnerStore = (ownerId: string) =>
  prisma.store.findUnique({
    where: { ownerId },
    include: {
      ratings: {
        include: { user: { select: { id: true, name: true, email: true, address: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

type OwnerStore = NonNullable<Awaited<ReturnType<typeof getOwnerStore>>>;

const toReviewers = (store: OwnerStore) =>
  store.ratings.map((r) => ({
    ratingId: r.id,
    score: r.score,
    createdAt: r.createdAt,
    user: r.user,
  }));

router.get(
  "/dashboard",
  asyncHandler<AuthRequest>(async (req, res) => {
    const store = await getOwnerStore(req.user!.id);
    if (!store) {
      res.status(404).json({ message: NO_STORE });
      return;
    }

    // how many 1-star, 2-star, ... ratings
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of store.ratings) breakdown[r.score]++;

    res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      stats: {
        averageRating: averageOf(store.ratings),
        totalRatings: store.ratings.length,
        breakdown,
      },
      reviewers: toReviewers(store),
    });
  })
);

router.get(
  "/reviewers",
  asyncHandler<AuthRequest>(async (req, res) => {
    const store = await getOwnerStore(req.user!.id);
    if (!store) {
      res.status(404).json({ message: NO_STORE });
      return;
    }

    const { sortBy, order } = getSort(req, ["name", "email", "score", "date"], "date");
    const reviewers = toReviewers(store);

    reviewers.sort((a, b) => {
      let diff: number;
      if (sortBy === "name") diff = a.user.name.localeCompare(b.user.name);
      else if (sortBy === "email") diff = a.user.email.localeCompare(b.user.email);
      else if (sortBy === "score") diff = a.score - b.score;
      else diff = a.createdAt.getTime() - b.createdAt.getTime();
      return order === "asc" ? diff : -diff;
    });

    res.json({ reviewers });
  })
);

export default router;
