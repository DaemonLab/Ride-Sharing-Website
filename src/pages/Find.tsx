import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import apiClient, { Ride } from "../services/api";
import { MapPin, Calendar, Clock } from "lucide-react";
import Button from "../components/Button";

interface ApiError extends Error {
  response?: {
    status?: number;
    data?: any;
  };
}

interface SearchParams {
  from: string;
  to: string;
  date: string;
  time: string;
}

export default function Find() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { isAuthenticated, login, user } = authContext;
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: "",
    to: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();

  // Fetch initial rides on component mount
  useEffect(() => {
    const fetchInitialRides = async () => {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        const initialRides = await apiClient.getAllRides();
        setRides(Array.isArray(initialRides) ? initialRides : []);
      } catch (error) {
        console.error("Error fetching initial rides:", error);
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          toast.error("Please log in to view rides");
          if (login) login();
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load rides';
          setError(errorMessage);
          toast.error(`Failed to load rides: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialRides();
  }, [isAuthenticated, login, user?.email]);

  const handleBooking = (ride: Ride) => {
    navigate('/book-ride', { 
      state: {
        rideDetails: ride,
      },
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.email) {
      toast.error('Please log in to search for rides');
      if (login) login();
      return;
    }

    if (!searchParams.from && !searchParams.to && !searchParams.date && !searchParams.time) {
      toast.error('Please enter at least one search criteria');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const searchWithEmail = { ...searchParams, email: user.email };
      const filteredRides = await apiClient.getFilteredRides(searchWithEmail);
      
      setRides(Array.isArray(filteredRides) ? filteredRides : []);
      
      if (!filteredRides || filteredRides.length === 0) {
        toast('No rides found matching your criteria', { icon: 'ℹ️' });
      } else {
        toast.success(`Found ${filteredRides.length} ride(s)`);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to search rides';
      console.error('Error searching rides:', errorMessage, error);
      setError(errorMessage);
      
      if (error?.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        if (login) login();
      } else {
        toast.error(`Search failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", { 
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-6">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-medium text-gray-900">
              Unable to Load Rides
            </h2>
            <p className="mt-2 text-gray-600">
              We're having trouble loading available rides right now. This might be a temporary issue.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>If the problem persists, please try again later or contact support.</p>
            <p className="mt-1 text-xs opacity-75">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading available rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Find a Ride</h1>

        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6"
        >
          {/* Search form fields */}
           <div className="space-y-4">
            <div className="flex items-center border rounded-lg p-3">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="From"
                className="w-full focus:outline-none bg-transparent"
                value={searchParams.from}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, from: e.target.value })
                }
              />
            </div>

            <div className="flex items-center border rounded-lg p-3">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="To"
                className="w-full focus:outline-none bg-transparent"
                value={searchParams.to}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, to: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center border rounded-lg p-3">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="date"
                  className="w-full focus:outline-none bg-transparent"
                  value={searchParams.date}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, date: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center border rounded-lg p-3">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="time"
                  className="w-full focus:outline-none bg-transparent"
                  value={searchParams.time}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, time: e.target.value })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Searching..." : "Search Rides"}
            </Button>
          </div>
        </form>

        {/* Results Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Available Rides
          </h2>

          {loading && (
            <div className="text-center py-8 text-gray-500">Loading rides...</div>
          )}
          
          {error && !loading && (
            <div className="text-center py-8 text-red-500 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!loading && !error && rides.map((ride: Ride, index: number) => (
              <div
                key={`${ride._id}-${index}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {ride.source} → {ride.destination}
                    </h3>
                    <p className="text-gray-600">
                      {formatDate(ride.date)} • {ride.time}
                    </p>
                    <p className="text-sm text-gray-500">
                      Vehicle: {ride.vehicleType || "Not specified"}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                        {ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      ₹{ride.totalCost || 'N/A'}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => handleBooking(ride)}
                      disabled={ride.seatsAvailable === 0}
                    >
                      {ride.seatsAvailable === 0 ? 'Full' : 'Request to Book'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && !error && rides.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white shadow-md rounded-xl p-6">
                No available rides match your search. Try adjusting your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}