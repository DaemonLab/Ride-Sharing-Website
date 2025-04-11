import React, { useState, useMemo } from "react";
import { Search, Calendar, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

interface RideData {
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  vehicle: string;
  vehicle_model: string;
  isBooked: boolean;
}

export default function Find() {
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();

  // Sample rides data (replace with actual data from backend)
  // Update the rides_data array
  const rides_data = [
    {
      from: "Campus",
      to: "Downtown",
      date: "2025-03-01",
      time: "14:00",
      price: 5,
      seats: 5,
      vehicle: "Car",
      vehicle_model: "Toyota Camry",
      isBooked: true,
    },
    {
      from: "Downtown",
      to: "Campus",
      date: "2025-03-02",
      time: "16:00",
      price: 5,
      seats: 4,
      vehicle: "SUV",
      vehicle_model: "Honda CR-V",
      isBooked: false,
    },
    {
      from: "Campus",
      to: "Airport",
      date: "2025-03-03",
      time: "10:00",
      price: 5,
      seats: 5,
      vehicle: "Car",
      vehicle_model: "Toyota Camry",
      isBooked: true,
    },
    {
      from: "Downtown",
      to: "Campus",
      date: "2025-03-04",
      time: "18:00",
      price: 5,
      seats: 7,
      vehicle: "SUV",
      vehicle_model: "Honda CR-V",
      isBooked: false,
    },
    {
      from: "Airport",
      to: "Campus",
      date: "2025-03-05",
      time: "12:00",
      price: 5,
      seats: 3,
      vehicle: "Car",
      vehicle_model: "Toyota Camry",
      isBooked: false,
    },
    {
      from: "Campus",
      to: "Downtown",
      date: "2025-03-06",
      time: "14:00",
      price: 5,
      seats: 2,
      vehicle: "SUV",
      vehicle_model: "Honda CR-V",
      isBooked: false,
    },
  ];

  const handleBooking = (ride: RideData) => {
    navigate("/book-ride", {
      state: {
        rideDetails: ride,
      },
    });
  };

  // Helper function to convert "HH:MM" to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const filteredRides = useMemo(() => {
    return rides_data.filter((ride) => {
      const matchFrom =
        !searchParams.from ||
        ride.from.toLowerCase().includes(searchParams.from.toLowerCase());
      const matchTo =
        !searchParams.to ||
        ride.to.toLowerCase().includes(searchParams.to.toLowerCase());
      const matchDate = !searchParams.date || ride.date === searchParams.date;

      let matchTime = true;
      if (searchParams.time && ride.time) {
        const selectedTime = timeToMinutes(searchParams.time);
        const rideTime = timeToMinutes(ride.time);
        matchTime = Math.abs(selectedTime - rideTime) <= 60; // ±1 hour
      }

      return matchFrom && matchTo && matchDate && matchTime;
    });
  }, [searchParams, rides_data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically through filteredRides
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
                className="w-full focus:outline-none"
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
                  className="w-full focus:outline-none"
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
                  className="w-full focus:outline-none"
                  value={searchParams.time}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, time: e.target.value })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Search Rides
            </Button>
          </div>
        </form>

        {/* Results Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Available Rides ({filteredRides.length})
          </h2>
          <div className="space-y-4">
            {filteredRides.map((ride, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {ride.from} → {ride.to}
                    </h3>
                    <p className="text-gray-600">
                      {formatDate(ride.date)} • {ride.time}
                    </p>
                    <p className="text-gray-600">
                      {ride.vehicle} • {ride.vehicle_model}
                    </p>
                    <p className="text-gray-600 mt-2">
                      <span
                        className={`${
                          ride.seats < 3 ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {ride.seats} seats available
                      </span>
                    </p>
                    <p className="text-gray-600 mt-2">
                      <span
                        className={`${
                          ride.isBooked == false
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      >
                        {` ${
                          ride.isBooked == false ? "Not PreBooked" : "PreBooked"
                        }`}
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
        </div>
      </div>
    </div>
  );
}
