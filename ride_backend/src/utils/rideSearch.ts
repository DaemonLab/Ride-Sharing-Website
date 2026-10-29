import type { Prisma } from "@prisma/client";
import type { RideSearchQuery } from "../validation/rideSchemas.js";

const TIME_WINDOW_MINUTES = 60;

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/** Builds the shared Prisma predicate for an available-ride search. */
export function buildAvailableRideWhere(query: RideSearchQuery): Prisma.ridesWhereInput {
  const where: Prisma.ridesWhereInput = {
    rideStatus: "Pending",
    seatsAvailable: { gt: 0 },
  };

  if (query.from) where.source = { contains: query.from, mode: "insensitive" };
  if (query.to) where.destination = { contains: query.to, mode: "insensitive" };
  if (query.date) where.date = query.date;

  if (query.time) {
    const selected = toMinutes(query.time);
    const lower = (selected - TIME_WINDOW_MINUTES + 24 * 60) % (24 * 60);
    const upper = (selected + TIME_WINDOW_MINUTES) % (24 * 60);

    // Stored times are canonical HH:mm strings, so lexicographical ranges are
    // chronological. A range spanning midnight needs two Prisma conditions.
    where.OR = lower <= upper
      ? [{ time: { gte: formatTime(lower), lte: formatTime(upper) } }]
      : [{ time: { gte: formatTime(lower) } }, { time: { lte: formatTime(upper) } }];
  }

  return where;
}

export function getPagination(page: number, pageSize: number, total: number) {
  const totalPages = Math.ceil(total / pageSize);
  const resolvedPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

  return {
    page: resolvedPage,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: resolvedPage > 1,
    hasNextPage: resolvedPage < totalPages,
    skip: (resolvedPage - 1) * pageSize,
  };
}
