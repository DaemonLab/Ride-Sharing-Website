import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import apiClient, { Ride } from "../services/api";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Car, 
  Users, 
  IndianRupee, 
  AlertCircle, 
  CheckCircle,
  Filter,
  RefreshCw,
  ArrowRight
} from "lucide-react";
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2 },
  },
};

const rideCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    y: -2,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const LoadingSpinner = ({ size = "w-8 h-8" }: { size?: string }) => (
  <motion.div
    className={`${size} border-3 border-blue-500 border-t-transparent rounded-full`}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4"
  >
    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Unable to Load Rides
      </h2>
      <p className="text-gray-600 mb-6">
        We're having trouble loading available rides. This might be a temporary issue.
      </p>
      <motion.button
        onClick={onRetry}
        className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </motion.button>
      <p className="mt-4 text-sm text-gray-500">
        If the problem persists, please contact support.
      </p>
      <p className="mt-1 text-xs text-gray-400">Error: {error}</p>
    </div>
  </motion.div>
);

const LoadingState = ({ message = "Loading available rides..." }: { message?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-2xl shadow-lg text-center"
    >
      <LoadingSpinner />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </motion.div>
  </div>
);

export default function Find() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { isAuthenticated, login, user } = authContext;
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
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
        // Filter out completed rides from the initial results
        const activeRides = Array.isArray(initialRides) 
          ? initialRides.filter(ride => ride.rideStatus !== 'Completed') 
          : [];
        setRides(activeRides);
      } catch (error) {
        console.error("Error fetching initial rides:", error);
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          toast.error("Please log in to view rides", {
            icon: <AlertCircle className="w-5 h-5" />,
          });
          if (login) login();
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load rides';
          setError(errorMessage);
          toast.error(`Failed to load rides: ${errorMessage}`, {
            icon: <AlertCircle className="w-5 h-5" />,
          });
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
      toast.error('Please log in to search for rides', {
        icon: <AlertCircle className="w-5 h-5" />,
      });
      if (login) login();
      return;
    }

    if (!searchParams.from && !searchParams.to && !searchParams.date && !searchParams.time) {
      toast.error('Please enter at least one search criteria', {
        icon: <AlertCircle className="w-5 h-5" />,
      });
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      const searchWithEmail = { ...searchParams, email: user.email };
      const filteredRides = await apiClient.getFilteredRides(searchWithEmail);
      
      // Filter out completed rides from the search results
      const activeRides = Array.isArray(filteredRides) 
        ? filteredRides.filter(ride => ride.rideStatus !== 'Completed')
        : [];
      setRides(activeRides);
      
      if (!filteredRides || filteredRides.length === 0) {
        toast('No rides found matching your criteria', { 
          icon: '🔍',
          style: { background: '#fef3c7', color: '#92400e' }
        });
      } else {
        toast.success(`Found ${filteredRides.length} ride(s)`, {
          icon: <CheckCircle className="w-5 h-5" />,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to search rides';
      console.error('Error searching rides:', errorMessage, error);
      setError(errorMessage);
      
      if (error?.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.', {
          icon: <AlertCircle className="w-5 h-5" />,
        });
        if (login) login();
      } else {
        toast.error(`Search failed: ${errorMessage}`, {
          icon: <AlertCircle className="w-5 h-5" />,
        });
      }
    } finally {
      setSearchLoading(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { 
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "N/A";
    try {
      const date = new Date(`2000-01-01T${timeStr}`);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const clearSearch = () => {
    setSearchParams({
      from: "",
      to: "",
      date: "",
      time: "",
    });
  };

  if (error && loading) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  // useEffect(( )=>{
  //   toast('This message will stay until dismissed!', {
  //     duration: 10000, 
  //   });
  // },[])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 ">
  
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          },
        }}
      />
      <div className="animate-bounce fixed bottom-4 right-4 z-50 bg-red-500 rounded-2xl flex items-center justify-center p-2 text-white text-xs w-60 "> 
        The prices are expected price per seat. It may change subject to change "Number of Members in Ride".
      </div>

      <motion.div
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="text-center mb-12 mt-12" variants={cardVariants}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Ride
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover available rides and connect with fellow travelers going your way
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          variants={cardVariants}
        >
          <motion.form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            whileHover="hover"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <Filter className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Search Rides</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* From Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
              >
                <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    className="w-full focus:outline-none bg-transparent text-gray-900 placeholder-gray-500"
                    value={searchParams.from}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, from: e.target.value })
                    }
                  />
                </div>
              </motion.div>

              {/* To Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
              >
                <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors">
                  <MapPin className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Drop-off location"
                    className="w-full focus:outline-none bg-transparent text-gray-900 placeholder-gray-500"
                    value={searchParams.to}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, to: e.target.value })
                    }
                  />
                </div>
              </motion.div>

              {/* Date Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
              >
                <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    type="date"
                    className="w-full focus:outline-none bg-transparent text-gray-900"
                    value={searchParams.date}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, date: e.target.value })
                    }
                  />
                </div>
              </motion.div>

              {/* Time Input */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
              >
                <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    type="time"
                    className="w-full focus:outline-none bg-transparent text-gray-900"
                    value={searchParams.time}
                    onChange={(e) =>
                      setSearchParams({ ...searchParams, time: e.target.value })
                    }
                  />
                </div>
              </motion.div>
            </div>

            {/* Search Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                type="submit"
                disabled={searchLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {searchLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <LoadingSpinner size="w-5 h-5" />
                      <span className="ml-2">Searching...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Rides
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                type="button"
                onClick={clearSearch}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear Filters
              </motion.button>
            </div>
          </motion.form>
        </motion.div>

        {/* Results Section */}
        <motion.div className="max-w-6xl mx-auto" variants={cardVariants}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">
              Available Rides
            </h2>
            <span className="text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200">
              {rides.length} ride{rides.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {searchLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Searching for rides...</p>
            </motion.div>
          )}
          
          {error && !searchLoading && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 text-red-600 bg-red-50 p-6 rounded-2xl border border-red-200"
            >
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            <motion.div className="grid gap-6" layout>
              {!searchLoading && !error && rides.slice().reverse().map((ride: Ride, index: number) => (
                <motion.div
                  key={`${ride._id}-${index}`}
                  variants={rideCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover="hover"
                  layout
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Route Information */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-2">
                            
                            <span className="font-semibold text-lg text-gray-900">
                              {ride.source}
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                          <div className="flex items-center space-x-2">
                            
                            <span className="font-semibold text-lg text-gray-900">
                              {ride.destination}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(ride.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(ride.time)}</span>
                          </div>
                          {ride.vehicleType && (
                            <div className="flex items-center">
                              <Car className="w-4 h-4 mr-2" />
                              <span>{ride.vehicleType}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center mt-3">
                          <Users className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''} available
                          </span>
                          
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex flex-col items-end space-y-4">
                        <div className="text-left">
                          <div className="flex items-center text-2xl font-bold text-blue-600 mb-1">
                            <IndianRupee className="w-6 h-6 mr-1" />
                            { (ride.totalCost/(ride.totalSeats- ride.seatsAvailable + 1)).toFixed(2) || 'N/A'} 
                          </div>
                          <p className="text-sm text-gray-500">Expected price per seat </p>
                          <p className="text-sm text-gray-500">Total price :  {ride.totalCost}</p>

                        </div>

                        <motion.button
                          onClick={() => handleBooking(ride)}
                          disabled={ride.seatsAvailable === 0}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            ride.seatsAvailable === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                          }`}
                          whileHover={ride.seatsAvailable > 0 ? { scale: 1.05 } : {}}
                          whileTap={ride.seatsAvailable > 0 ? { scale: 0.95 } : {}}
                        >
                          {ride.seatsAvailable === 0 ? 'Fully Booked' : 'Request to Book'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {!searchLoading && !error && rides.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No rides found
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    No available rides match your search criteria. Try adjusting your filters or check back later.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}