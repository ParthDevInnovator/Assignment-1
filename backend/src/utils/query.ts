import { Request } from "express";

export type SortOrder = "asc" | "desc";

// Reads ?sortBy=&order= and falls back to defaults if the field isn't allowed.
export function getSort<T extends string>(req: Request, allowed: readonly T[], fallback: T) {
  const sortBy = allowed.includes(req.query.sortBy as T) ? (req.query.sortBy as T) : fallback;
  const order: SortOrder = req.query.order === "desc" ? "desc" : "asc";
  return { sortBy, order };
}

export function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
