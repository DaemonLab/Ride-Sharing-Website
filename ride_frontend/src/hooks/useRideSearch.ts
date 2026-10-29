import { useEffect, useMemo, useState } from "react";
import { searchRides } from "../services/rideService";
import type { PaginatedRides, RideSearchParams } from "../types";

const emptyResult: PaginatedRides = {
  items: [],
  meta: { page: 1, pageSize: 6, total: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false },
};

/** Fetches the exact search represented by the Find-page URL. */
export function useRideSearch(params: RideSearchParams) {
  const [result, setResult] = useState<PaginatedRides>(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const request = useMemo(() => ({
    from: params.from,
    to: params.to,
    date: params.date,
    time: params.time,
    page: params.page,
    pageSize: params.pageSize,
  }), [params.from, params.to, params.date, params.time, params.page, params.pageSize]);
  const requestKey = JSON.stringify(request);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    searchRides(request)
      .then((data) => { if (active) setResult(data); })
      .catch(() => { if (active) setError("Failed to load rides. Please try again."); })
      .finally(() => { if (active) { setResolvedKey(requestKey); setLoading(false); } });
    return () => { active = false; };
  }, [request, requestKey]);

  return { ...result, loading: loading || resolvedKey !== requestKey, error };
}
