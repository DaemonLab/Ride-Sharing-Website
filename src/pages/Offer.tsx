import React, { useState } from "react";
import { MapPin, Calendar, Clock, Users, IndianRupee, Car } from "lucide-react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useRides } from "../hooks/useRides";
import { NewRidePayload } from "../types";

/**
 * UI Layer — Offer
 *
 * This page ONLY:
 *  1. Manages local form state
 *  2. Calls submitRide() from useRides on form submit
 *  3. Renders JSX based on hook state (loading, error, submitSuccess)
 *
 * Previously handleSubmit did nothing — now it calls the backend via the hook.
 */
export default function Offer() {
  const navigate = useNavigate();

  // Hook provides the submitRide action and state
  const { submitRide, loading, error, submitSuccess } = useRides("none");

  const [rideDetails, setRideDetails] = useState<NewRidePayload>({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: 0,
    price: 0,
    vehicle: "",
    vehicle_model: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitRide(rideDetails);
    if (success) {
      navigate("/find");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Offer a Ride</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center border rounded-lg p-3">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Starting Point"
                className="w-full focus:outline-none"
                value={rideDetails.from}
                onChange={(e) =>
                  setRideDetails({ ...rideDetails, from: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center border rounded-lg p-3">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Destination"
                className="w-full focus:outline-none"
                value={rideDetails.to}
                onChange={(e) =>
                  setRideDetails({ ...rideDetails, to: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center border rounded-lg p-3">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="date"
                  className="w-full focus:outline-none"
                  value={rideDetails.date}
                  onChange={(e) =>
                    setRideDetails({ ...rideDetails, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex items-center border rounded-lg p-3">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="time"
                  className="w-full focus:outline-none"
                  value={rideDetails.time}
                  onChange={(e) =>
                    setRideDetails({ ...rideDetails, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center border rounded-lg p-3">
                <Users className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  placeholder="Available Seats"
                  className="w-full focus:outline-none"
                  value={rideDetails.seats || ""}
                  onChange={(e) =>
                    setRideDetails({
                      ...rideDetails,
                      seats: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min={1}
                />
              </div>

              <div className="flex items-center border rounded-lg p-3">
                <IndianRupee className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  placeholder="Total Price"
                  className="w-full focus:outline-none"
                  value={rideDetails.price || ""}
                  onChange={(e) =>
                    setRideDetails({
                      ...rideDetails,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  min={0}
                />
              </div>
            </div>

            <div className="flex items-center border rounded-lg p-3">
              <Car className="w-5 h-5 text-gray-400 mr-2" />
              <select
                className="w-full focus:outline-none bg-transparent"
                value={rideDetails.vehicle}
                onChange={(e) =>
                  setRideDetails({ ...rideDetails, vehicle: e.target.value })
                }
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="rickshaw">Rickshaw</option>
                <option value="cab">Cab</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div className="flex items-center border rounded-lg p-3">
              <Car className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Car Model (e.g. Honda City)"
                className="w-full focus:outline-none"
                value={rideDetails.vehicle_model}
                onChange={(e) =>
                  setRideDetails({
                    ...rideDetails,
                    vehicle_model: e.target.value,
                  })
                }
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Posting..." : "Post Ride"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
