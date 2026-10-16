import { Router } from "express";
import { prisma } from "../db";
import { authenticate, allowRoles, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { averageOf } from "../utils/rating";
import { ratingSchema } from "../utils/validation";

const router = Router();
router.use(authenticate, allowRoles("USER"));

// Creates the rating, or updates it if this user already rated the store
router.post(
  "/",
  validate(ratingSchema),
  asyncHandler<AuthRequest>(async (req, res) => {
    const { storeId, score } = req.body;
    const userId = req.user!.id;

    if (!(await prisma.store.findUnique({ where: { id: storeId } }))) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    const rating = await prisma.rating.upsert({
      where: { userId_storeId: { userId, storeId } },
      update: { score },
      create: { userId, storeId, score },
    });

    const ratings = await prisma.rating.findMany({ where: { storeId }, select: { score: true } });

    res.json({
      message: "Rating saved",
      rating,
      storeStats: { averageRating: averageOf(ratings), totalRatings: ratings.length },
    });
  })
);

router.get(
  "/my-ratings",
  asyncHandler<AuthRequest>(async (req, res) => {
    const ratings = await prisma.rating.findMany({
      where: { userId: req.user!.id },
      include: { store: { select: { id: true, name: true, address: true } } },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ ratings });
  })
);

export default router;
