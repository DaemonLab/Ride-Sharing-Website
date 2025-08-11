import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  ArrowLeft,
  Minus,
  Plus,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import { toast, Toaster } from "react-hot-toast";

interface RideDetails {
  _id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  totalCost: number;
  seatsAvailable: number;
  totalSeats: number;
  vehicleType: string;
  vehicleModel?: string;
  createdBy: {
    id: string;
    name: string;
  };
  rideStatus: string;
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
    y: -2,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

const seatControlVariants = {
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

const LoadingSpinner = () => (
  <motion.div
    className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

export default function BookRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState(1);

  const rideDetails = location.state?.rideDetails as RideDetails | undefined;

  useEffect(() => {
    if (!rideDetails) {
      toast.error("No ride details found. Redirecting...", {
        icon: <AlertCircle className="w-5 h-5" />,
      });
      const timer = setTimeout(() => navigate("/find"), 2000);
      return () => clearTimeout(timer);
    }
  }, [rideDetails, navigate]);

  const handleRequestRide = async () => {
    // Enhanced validation
    if (!user?.id) {
      toast.error("Please sign in to request a ride", {
        icon: <AlertCircle className="w-5 h-5" />,
      });
      navigate("/login");
      return;
    }

    // Check if ride is completed
    if (rideDetails?.rideStatus === 'Completed') {
      toast.error("This ride has already been completed and cannot be booked", {
        icon: <AlertCircle className="w-5 h-5" />,
      });
      return;
    }

    if (user.id === rideDetails?.createdBy?.id) {
      toast.error("You cannot book your own ride.", {
        icon: <AlertCircle className="w-5 h-5" />,
      });
      return;
    }

    if (!rideDetails?._id) {
      toast.error("Invalid ride details. Please try again.", {
        icon: <AlertCircle className="w-5 h-5" />,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.sendRideRequest(
        rideDetails._id,
        user.id
      );

      if (response?.success) {
        toast.success("Ride request sent successfully!", {
          icon: <CheckCircle className="w-5 h-5" />,
        });
        setTimeout(() => navigate("/requests"), 1500);
      } else {
        throw new Error(response?.message || "Failed to send ride request");
      }
    } catch (error: any) {
      console.error("Error requesting ride:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send ride request. Please try again.";
      toast.error(errorMessage, {
        icon: <AlertCircle className="w-5 h-5" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatChange = (amount: number) => {
    if (!rideDetails) return;

    setSeatsRequested((prev) => {
      const newSeats = prev + amount;
      if (newSeats < 1) return 1;
      if (newSeats > rideDetails.seatsAvailable) {
        toast.error(`Only ${rideDetails.seatsAvailable} seats available`, {
          icon: <AlertCircle className="w-5 h-5" />,
        });
        return rideDetails.seatsAvailable;
      }
      return newSeats;
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  // Loading state
  if (loading || !rideDetails) {
    return <LoadingSpinner />;
  }

  // If ride is completed, show a message
  if (rideDetails.rideStatus === 'Completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Ride Completed
              </h2>
              <p className="mt-2 text-gray-600">
                This ride has been completed and is no longer available for booking.
              </p>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/find')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Find Another Ride
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate number of members (including the current user booking)
  const membersCount = rideDetails.totalSeats - rideDetails.seatsAvailable + seatsRequested;
  // Avoid division by zero
  const pricePerSeat = membersCount > 0 ? (rideDetails.totalCost / membersCount) : rideDetails.totalCost;
  const totalPrice = (pricePerSeat * seatsRequested).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ">
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
      
      <motion.div
        className="container mx-auto px-4 py-8 max-w-4xl mt-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={cardVariants}
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Results</span>
          </motion.button>
        </motion.div>

        {/* Page Title */}
        <motion.div className="text-center mb-12" variants={cardVariants}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Request Your Ride
          </h1>
          <p className="text-gray-600 text-lg">
            Review details and confirm your booking
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Information */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Route Details
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Route visualization */}
                  <div className="relative">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-8 bg-gray-300 my-2"></div>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 space-y-8">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Pickup Location</p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {rideDetails.source}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Drop-off Location</p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {rideDetails.destination}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(rideDetails.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(rideDetails.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Driver Information */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Driver Information
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {rideDetails.createdBy?.name?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {rideDetails.createdBy?.name || "Driver"}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Car className="w-4 h-4 mr-1" />
                    <span>
                      {rideDetails.vehicleType}
                      {rideDetails.vehicleModel && ` • ${rideDetails.vehicleModel}`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <motion.div className="lg:col-span-1" variants={cardVariants}>
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8"
              whileHover="hover"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Booking Summary
              </h2>

              {/* Seat Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-gray-700 font-medium">
                    Number of Seats
                  </label>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handleSeatChange(-1)}
                      disabled={seatsRequested <= 1}
                      variants={seatControlVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Minus className="h-4 w-4" />
                    </motion.button>
                    <motion.span 
                      className="font-bold text-xl w-8 text-center"
                      key={seatsRequested}
                      initial={{ scale: 1.2, color: "#3b82f6" }}
                      animate={{ scale: 1, color: "#1f2937" }}
                      transition={{ duration: 0.2 }}
                    >
                      {seatsRequested}
                    </motion.span>
                    <motion.button
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handleSeatChange(1)}
                      disabled={seatsRequested >= rideDetails.seatsAvailable}
                      variants={seatControlVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {rideDetails.seatsAvailable} seats available
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 py-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Price per seat</span>
                  <span>₹{pricePerSeat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Seats selected</span>
                  <span>{seatsRequested}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total Amount</span>
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.1, color: "#3b82f6" }}
                    animate={{ scale: 1, color: "#1f2937" }}
                    transition={{ duration: 0.3 }}
                  >
                    ₹{totalPrice}
                  </motion.span>
                </div>
              </div>

              {/* Book Button */}
              <motion.button
                className="w-full mt-6 bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                onClick={handleRequestRide}
                disabled={loading}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <LoadingSpinner />
                      <span>Sending Request...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Send Ride Request
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Your request will be sent to the person who posted this ride for approval
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}