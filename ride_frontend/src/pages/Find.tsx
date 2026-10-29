import React, { useEffect, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { Search, SearchX, MapPin, Car, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useRideSearch } from "../hooks/useRideSearch";
import { Ride } from "../types";
import { useAuth } from "../hooks/useAuth";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomTimePicker from "../components/CustomTimePicker";

const searchParsers = {
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  date: parseAsString.withDefault(""),
  time: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(6),
};

type DraftFilters = { from: string; to: string; date: string; time: string };

const toDraft = (query: DraftFilters): DraftFilters => ({
  from: query.from,
  to: query.to,
  date: query.date,
  time: query.time,
});

export default function Find() {
  const [query, setQuery] = useQueryStates(searchParsers);
  const [draft, setDraft] = useState<DraftFilters>(() => toDraft(query));
  const { from, to, date, time } = query;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, meta, loading, error } = useRideSearch(query);

  // Browser navigation and shared links update both the results and visible form.
  useEffect(() => {
    setDraft({ from, to, date, time });
  }, [from, to, date, time]);

  // The server clamps stale/out-of-range page links; reflect that canonical
  // page back into the URL without adding a history entry.
  useEffect(() => {
    if (!loading && !error && query.page !== meta.page) {
      void setQuery({ page: meta.page }, { history: "replace" });
    }
  }, [error, loading, meta.page, query.page, setQuery]);

  const handleBooking = (ride: Ride) => {
    if (String(ride.userId) === String(user?.id)) return;
    navigate("/book-ride", { state: { rideDetails: ride } });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    void setQuery({ ...draft, page: 1 }, { history: "push" });
  };

  const updateFilter = <Key extends keyof DraftFilters>(key: Key, value: DraftFilters[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    // Keep searches shareable while typing, without polluting browser history.
    void setQuery({ [key]: value, page: 1 }, { history: "replace" });
  };

  const clearSearch = () => {
    void setQuery({ from: null, to: null, date: null, time: null, page: null, pageSize: null }, { history: "push" });
  };

  const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  const firstItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const lastItem = Math.min(meta.page * meta.pageSize, meta.total);
  const displayedPageCount = Math.max(meta.totalPages, 1);
  const hasActiveFilters = Boolean(from || to || date || time);

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-[110px] top-10 -left-24 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-0 -right-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-2 text-ink">Find a Ride</h1>
        <p className="text-center text-ink-variant mb-10">Search rides posted by fellow students heading your way</p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto glass-strong rounded-md p-6 md:p-8 relative z-20">
          <div className="space-y-4">
            <SearchInput placeholder="From" value={draft.from} onChange={(from) => updateFilter("from", from)} />
            <SearchInput placeholder="To" value={draft.to} onChange={(to) => updateFilter("to", to)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">Filter by Date</label>
                <CustomDatePicker value={draft.date} placeholder="Any Date" onChange={(date) => updateFilter("date", date)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-variant uppercase tracking-wider mb-1.5 px-1">
                  Filter by Time <span className="normal-case font-normal text-ink-variant/60">(±1 hr)</span>
                </label>
                <CustomTimePicker value={draft.time} placeholder="Any Time" onChange={(time) => updateFilter("time", time)} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" size="lg"><Search className="w-4 h-4 mr-2" />Search Rides</Button>
              <Button type="button" variant="ghost" size="lg" onClick={clearSearch}>Clear</Button>
            </div>
          </div>
        </form>

        <div className="max-w-4xl mx-auto mt-14 relative z-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h2 className="font-display text-xl font-semibold text-ink">Available Rides ({meta.total})</h2>
            {!loading && meta.total > 0 && <p className="text-sm text-ink-variant">Showing {firstItem}–{lastItem} of {meta.total}</p>}
          </div>

          {loading && <div className="text-center py-8 text-ink-variant">Loading rides...</div>}
          {error && !loading && <div className="text-center py-8 text-danger">{error}</div>}

          {!loading && !error && (
            <>
              <div className="space-y-4">
                {items.map((ride) => <RideCard key={ride.id} ride={ride} onBook={handleBooking} currentUserID={user?.id} formatDate={formatDate} />)}
                {items.length === 0 && (
                  <section className="glass-card rounded-2xl px-5 py-12 text-center sm:px-10" aria-live="polite">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <SearchX className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {hasActiveFilters ? "No matching rides" : "No rides available yet"}
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-variant">
                      {hasActiveFilters
                        ? "Try changing the route, date, or time filters to see more options."
                        : "Be the first to share a trip with fellow students."}
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                      {hasActiveFilters && <Button variant="ghost" onClick={clearSearch}>Clear filters</Button>}
                      <Button variant={hasActiveFilters ? "secondary" : "primary"} onClick={() => navigate("/offer")}>Offer a ride</Button>
                    </div>
                  </section>
                )}
              </div>
              <nav className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/55 p-2 shadow-[0_10px_30px_rgba(46,123,255,0.08)] backdrop-blur-md" aria-label="Ride search pages">
                <Button size="sm" variant="ghost" className="px-3" disabled={!meta.hasPreviousPage} onClick={() => void setQuery({ page: meta.page - 1 }, { history: "push" })}>
                  <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
                </Button>
                <span className="min-w-24 rounded-xl bg-primary/10 px-3 py-2 text-center text-sm font-semibold text-primary-dark">
                  {meta.page} <span className="font-normal text-ink-variant">/</span> {displayedPageCount}
                </span>
                <Button size="sm" variant="ghost" className="px-3" disabled={!meta.hasNextPage} onClick={() => void setQuery({ page: meta.page + 1 }, { history: "push" })}>
                  <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="glass-input flex items-center rounded-lg px-4 py-3">
      <MapPin className="w-5 h-5 text-primary mr-3 shrink-0" />
      <input type="text" placeholder={placeholder} className="w-full bg-transparent focus:outline-none text-ink placeholder:text-ink-variant/60 text-sm" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function RideCard({ ride, onBook, currentUserID, formatDate }: { ride: Ride; onBook: (ride: Ride) => void; currentUserID?: string; formatDate: (date: string) => string }) {
  const isOwnRide = String(ride.userId) === String(currentUserID);
  return (
    <div className="glass-card rounded-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2">{ride.from}<span className="text-primary">→</span>{ride.to}</h3>
          <p className="text-ink-variant text-sm mt-1">{ride.date ? formatDate(ride.date) : ""} • {ride.time}</p>
          <p className="text-ink-variant text-sm mt-1 flex items-center gap-1.5 capitalize"><Car className="w-4 h-4 text-primary" />{ride.vehicle}</p>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-secondary/10 text-secondary-dark border-secondary/30 mt-3"><Users className="w-3 h-3" />{ride.seats} passenger seats available</span>
        </div>
        <div className="text-right shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3">
          <p className="text-lg font-display font-bold text-primary">{!ride.price || Number(ride.price) <= 0 ? "Price to be decided" : `₹${ride.price}`}</p>
          <Button size="sm" onClick={() => onBook(ride)} disabled={ride.seats === 0 || isOwnRide}>{ride.seats === 0 ? "Sold Out" : isOwnRide ? "Your Ride" : "Book Now"}</Button>
        </div>
      </div>
    </div>
  );
}
