import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Car,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import apiClient, { CreateRideData } from "../services/api";

interface RideDetails {
  from: string;
  to: string;
  date: string;
  time: string;
  seats: string;
  price: string;
  vehicle: string;
  vehicle_model: string;
  booked_seats: string;
}

interface InputFieldProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  delay?: number;
}

const VEHICLE_SEAT_LIMITS = {
  car: 8,
  rickshaw: 3,
  default: 10,
};

const InputField: React.FC<InputFieldProps> = ({
  icon,
  children,
  error,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="flex flex-col space-y-2"
  >
    <div
      className={`flex items-center border-2 rounded-xl p-4 transition-all duration-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:bg-blue-50/30 ${
        error
          ? "border-red-300 bg-red-50/30"
          : "border-gray-200 bg-white hover:bg-gray-50/50"
      }`}
    >
      <div className="text-gray-400 mr-3">{icon}</div>
      {children}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-red-500 text-sm font-medium px-2"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function Offer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<RideDetails>>({});
  const [focusedField, setFocusedField] = useState<string>("");

  const [rideDetails, setRideDetails] = useState<RideDetails>({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: "",
    price: "",
    vehicle: "",
    vehicle_model: "",
    booked_seats: "0",
  });

  // Determine the max seats based on the selected vehicle
  const maxSeats = rideDetails.vehicle
    ? VEHICLE_SEAT_LIMITS[
        rideDetails.vehicle as keyof typeof VEHICLE_SEAT_LIMITS
      ]
    : VEHICLE_SEAT_LIMITS.default;

  // Effect to adjust seats if vehicle type changes and seats exceed new limit
  useEffect(() => {
    if (rideDetails.seats && parseInt(rideDetails.seats, 10) > maxSeats) {
      setRideDetails((prev) => ({ ...prev, seats: String(maxSeats) }));
      toast.error(
        `Seat limit for this vehicle is ${maxSeats}. We've adjusted it for you.`,
        { icon: "ℹ️" }
      );
    }
  }, [rideDetails.vehicle, maxSeats]);
  const validateForm = (): boolean => {
    const newErrors: Partial<RideDetails> = {};

    if (!rideDetails.from.trim())
      newErrors.from = "Pickup location is required";
    if (!rideDetails.to.trim()) newErrors.to = "Destination is required";
    if (!rideDetails.date) newErrors.date = "Date is required";
    if (!rideDetails.time) newErrors.time = "Time is required";
    if (!rideDetails.seats) newErrors.seats = "Number of seats is required";
    if (!rideDetails.price) newErrors.price = "Price is required";
    if (!rideDetails.vehicle) newErrors.vehicle = "Vehicle type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user?.email) {
      toast.error("Please log in to offer a ride");
      return;
    }

    setIsSubmitting(true);

    try {
      const seats = parseInt(rideDetails.seats, 10);
      const rideData: CreateRideData = {
        email: user.email,
        source: rideDetails.from,
        destination: rideDetails.to,
        date: rideDetails.date,
        time: rideDetails.time,
        seatsAvailable: seats,
        totalSeats: seats, // Set totalSeats equal to seatsAvailable
        totalCost: parseFloat(rideDetails.price),
        vehicleType: rideDetails.vehicle,
        vehicleModel: rideDetails.vehicle_model || undefined,
      };

      await apiClient.createRide(rideData);

      toast.success("🎉 Ride offered successfully!");
      navigate("/find");
    } catch (error) {
      console.error("Error offering ride:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to offer ride";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "seats") {
      const numValue = parseInt(value, 10);
      if (numValue > maxSeats) {
        setRideDetails((prev) => ({ ...prev, seats: String(maxSeats) }));
        toast.error(
          `You can only offer a maximum of ${maxSeats} seats for this vehicle.`
        );
        return;
      }
    }
    setRideDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof RideDetails]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 mt-8">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Offer Your Ride
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your journey with others and make some new friends along the
            way.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12"
        >
          <div className="space-y-8">
            {/* Route Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Route Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={<MapPin className="w-6 h-6" />}
                  error={errors.from}
                  delay={0.1}
                >
                  <input
                    type="text"
                    name="from"
                    placeholder="From (Pickup Location)"
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 font-sm"
                    value={rideDetails.from}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("from")}
                    onBlur={handleBlur}
                  />
                </InputField>

                <InputField
                  icon={<ArrowRight className="w-6 h-6" />}
                  error={errors.to}
                  delay={0.2}
                >
                  <input
                    type="text"
                    name="to"
                    placeholder="To (Destination)"
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 font-sm"
                    value={rideDetails.to}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("to")}
                    onBlur={handleBlur}
                  />
                </InputField>
              </div>
            </motion.div>

            {/* Date & Time Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Schedule
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={<Calendar className="w-6 h-6" />}
                  error={errors.date}
                  delay={0.1}
                >
                  <input
                    type="date"
                    name="date"
                    className="w-full outline-none bg-transparent text-gray-700 font-sm"
                    value={rideDetails.date}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("date")}
                    onBlur={handleBlur}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </InputField>

                <InputField
                  icon={<Clock className="w-6 h-6" />}
                  error={errors.time}
                  delay={0.2}
                >
                  <input
                    type="time"
                    name="time"
                    step="3600"
                    className="w-full outline-none bg-transparent text-gray-700 font-sm"
                    value={rideDetails.time}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus("time")}
                    onBlur={handleBlur}
                  />
                </InputField>
              </div>
            </motion.div>

            {/* Ride Information Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-1">
                Ride Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  icon={<Users className="w-6 h-6" />}
                  error={errors.seats}
                  delay={0.1}
                >
                  <input
                    type="number"
                    name="seats"
                    placeholder="Available Seats"
                    min="1"
                    max={maxSeats} // DYNAMIC MAX ATTRIBUTE
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 font-sm"
                    value={rideDetails.seats}
                    onChange={handleInputChange}
                  />
                </InputField>

                <InputField
                  icon={<IndianRupee className="w-6 h-6" />}
                  error={errors.price}
                  delay={0.2}
                >
                  <input
                    type="number"
                    name="price"
                    placeholder="Total Price (₹)"
                    min="0"
                    step="10"
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400 font-sm"
                    value={rideDetails.price}
                    onChange={handleInputChange}
                  />
                </InputField>

                <InputField
                  icon={<Car className="w-6 h-6" />}
                  error={errors.vehicle}
                  delay={0.3}
                >
                  <select
                    name="vehicle"
                    className="w-full outline-none bg-transparent text-gray-700 font-medium"
                    value={rideDetails.vehicle}
                    onChange={handleInputChange}
                  >
                    <option value="" className="text-gray-400">
                      Select Vehicle
                    </option>
                    <option value="car" className="text-gray-700">
                      🚗 Car
                    </option>
                    <option value="rickshaw" className="text-gray-700">
                      🛺 Rickshaw
                    </option>
                  </select>
                </InputField>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg py-4 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  disabled={isSubmitting}
                >
                  <motion.div
                    className="flex items-center justify-center space-x-2"
                    animate={isSubmitting ? { opacity: 0.7 } : { opacity: 1 }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Publishing Ride...</span>
                      </>
                    ) : (
                      <>
                        <span> Offer Your Ride</span>
                        <ArrowRight className="w-5 h-5 hover:rotate-90 transition-all duration-300" />
                      </>
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.form>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            🔒 Your information is secure and will only be shared with confirmed
            passengers
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
