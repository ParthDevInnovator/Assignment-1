import { Router } from "express";
import { prisma } from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { averageOf } from "../utils/rating";
import { getSort, getString } from "../utils/query";

const router = Router();
router.use(authenticate);

type StoreWithRatings = {
  id: string;
  name: string;
  email: string;
  address: string;
  createdAt: Date;
  ratings: { userId: string; score: number }[];
};

// Adds the overall average plus the logged-in user's own rating (null if not rated)
const withRatingInfo = ({ ratings, ...store }: StoreWithRatings, userId: string) => ({
  ...store,
  averageRating: averageOf(ratings),
  totalRatings: ratings.length,
  userRating: ratings.find((r) => r.userId === userId)?.score ?? null,
});

router.get(
  "/",
  asyncHandler<AuthRequest>(async (req, res) => {
    const search = getString(req.query.search);
    const { sortBy, order } = getSort(req, ["name", "address", "rating"], "name");

    const stores = await prisma.store.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: sortBy === "rating" ? undefined : { [sortBy]: order },
      include: { ratings: { select: { userId: true, score: true } } },
    });

    const result = stores.map((s) => withRatingInfo(s, req.user!.id));

    if (sortBy === "rating") {
      result.sort((a, b) =>
        order === "asc" ? a.averageRating - b.averageRating : b.averageRating - a.averageRating
      );
    }

    res.json({ stores: result });
  })
);

router.get(
  "/:id",
  asyncHandler<AuthRequest>(async (req, res) => {
    const store = await prisma.store.findUnique({
      where: { id: String(req.params.id) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { userId: true, score: true } },
      },
    });

    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    res.json({ store: withRatingInfo(store, req.user!.id) });
  })
);

export default router;
