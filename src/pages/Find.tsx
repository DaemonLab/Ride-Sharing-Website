import React, { useState, useMemo } from "react";
import { Search, Calendar, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useRides } from "../hooks/useRides";
import { Ride, RideFilters } from "../types";

/**
 * UI Layer — Find
 *
 * This page ONLY:
 *  1. Reads state from useRides() hook
 *  2. Renders JSX
 *  3. Calls hook actions (fetchRides) on user interaction
 *
 * No fetch(), no axios, no import.meta.env here.
 */
export default function Find() {
  const [filters, setFilters] = useState<RideFilters>({
    from: "",
    to: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();

  // Hook manages all data fetching — "find" mode auto-fetches on mount
  const { rides, loading, error, fetchRides } = useRides("find");

  const handleBooking = (ride: Ride) => {
    navigate("/book-ride", {
      state: {
        rideDetails: ride,
      },
    });
  };

  // Helper to convert "HH:MM" to minutes for time comparison
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Client-side filter on top of the fetched rides (for instant UX)
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const matchFrom =
        !filters.from ||
        (ride.from ?? "").toLowerCase().includes(filters.from.toLowerCase());
      const matchTo =
        !filters.to ||
        (ride.to ?? "").toLowerCase().includes(filters.to.toLowerCase());
      const matchDate = !filters.date || ride.date === filters.date;

      let matchTime = true;
      if (filters.time && ride.time) {
        const selectedTime = timeToMinutes(filters.time);
        const rideTime = timeToMinutes(ride.time);
        matchTime = Math.abs(selectedTime - rideTime) <= 60; // ±1 hour
      }

      return matchFrom && matchTo && matchDate && matchTime;
    });
  }, [filters, rides]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-fetch from backend with filters applied server-side
    fetchRides(filters);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Find a Ride</h1>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center border rounded-lg p-3">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="From"
                className="w-full focus:outline-none"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </div>

            <div className="flex items-center border rounded-lg p-3">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="To"
                className="w-full focus:outline-none"
                value={filters.to}
                onChange={(e) =>
                  setFilters({ ...filters, to: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center border rounded-lg p-3">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="date"
                  className="w-full focus:outline-none"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center border rounded-lg p-3">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="time"
                  className="w-full focus:outline-none"
                  value={filters.time}
                  onChange={(e) =>
                    setFilters({ ...filters, time: e.target.value })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Search className="w-4 h-4 mr-2 inline" />
              Search Rides
            </Button>
          </div>
        </form>

        {/* Results Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Available Rides ({filteredRides.length})
          </h2>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8 text-gray-500">Loading rides...</div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}

          {/* Ride cards */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredRides.map((ride, index) => (
                <div
                  key={ride.id ?? index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {ride.from} → {ride.to}
                      </h3>
                      <p className="text-gray-600">
                        {ride.date ? formatDate(ride.date) : ""} • {ride.time}
                      </p>
                      <p className="text-gray-600">
                        {ride.vehicle} • {ride.vehicle_model}
                      </p>
                      <p className="text-gray-600 mt-2">
                        <span
                          className={`${
                            (ride.seats ?? 0) < 3
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {ride.seats} seats available
                        </span>
                      </p>
                      <p className="text-gray-600 mt-2">
                        <span
                          className={`${
                            ride.isBooked === false
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}
                        >
                          {ride.isBooked === false ? "Not PreBooked" : "PreBooked"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        ₹{ride.price}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleBooking(ride)}
                        disabled={ride.seats === 0}
                      >
                        {ride.seats === 0 ? "Sold Out" : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRides.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No rides found matching your search criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
