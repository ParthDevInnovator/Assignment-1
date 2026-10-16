export function averageOf(ratings: { score: number }[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((total, r) => total + r.score, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
