import React, { useState } from "react";
import { MapPin, Calendar, Clock, Users, IndianRupee, Car } from "lucide-react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

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

export default function Offer() {
  const navigate = useNavigate();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add API call here to save ride details
    navigate("/find");
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
                  value={rideDetails.seats}
                  onChange={(e) =>
                    setRideDetails({ ...rideDetails, seats: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center border rounded-lg p-3">
                <IndianRupee className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  placeholder="Total Price"
                  className="w-full focus:outline-none"
                  value={rideDetails.price}
                  onChange={(e) =>
                    setRideDetails({ ...rideDetails, price: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center border rounded-lg p-3">
              <Car className="w-5 h-5 text-gray-400 mr-2" />
              <select
                className="w-full focus:outline-none bg-transparent"
                value={rideDetails.vehicleType}
                onChange={(e) =>
                  setRideDetails({
                    ...rideDetails,
                    vehicleType: e.target.value,
                  })
                }
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
                placeholder="Car Model"
                className="w-full focus:outline-none"
                value={rideDetails.carModel}
                onChange={(e) =>
                  setRideDetails({ ...rideDetails, carModel: e.target.value })
                }
              />
            </div>

            <Button className="w-full" size="lg">
              Post Ride
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
