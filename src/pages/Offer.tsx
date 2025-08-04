import React, { useState, useContext } from "react";
import { MapPin, Calendar, Clock, Users, IndianRupee, Car } from "lucide-react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext , useAuth } from "../context/AuthContext";
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

export default function Offer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<RideDetails>>({});
  
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

  const validateForm = (): boolean => {
    const newErrors: Partial<RideDetails> = {};
    
    if (!rideDetails.from.trim()) newErrors.from = 'Please enter a pickup location';
    if (!rideDetails.to.trim()) newErrors.to = 'Please enter a drop-off location';
    if (!rideDetails.date) newErrors.date = 'Please select a date';
    if (!rideDetails.time) newErrors.time = 'Please select a time';
    if (!rideDetails.seats) newErrors.seats = 'Please enter number of seats';
    if (!rideDetails.price) newErrors.price = 'Please enter price per seat';
    if (!rideDetails.vehicle) newErrors.vehicle = 'Please select a vehicle type';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.email) {
      toast.error('Please log in to offer a ride');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const rideData: CreateRideData = {
        email: user.email,
        source: rideDetails.from,
        destination: rideDetails.to,
        date: rideDetails.date,
        time: rideDetails.time,
        seatsAvailable: parseInt(rideDetails.seats, 10),
        totalCost: parseFloat(rideDetails.price),
        vehicleType: rideDetails.vehicle,
        vehicleModel: rideDetails.vehicle_model || undefined,
      };
      
      await apiClient.createRide(rideData);
      
      toast.success('Ride offered successfully!');
      navigate('/find');
    } catch (error) {
      console.error('Error offering ride:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to offer ride';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRideDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof RideDetails]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Safely access user email with null check
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Offer a Ride</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6"
        >
          <div className="space-y-4">
            {/* From */}
            <div className="flex flex-col">
              <div className="flex items-center border rounded-lg p-3">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="from"
                  placeholder="From (Pickup Location)"
                  className="w-full outline-none bg-transparent"
                  value={rideDetails.from}
                  onChange={handleInputChange}
                />
              </div>
              {errors.from && <p className="text-red-500 text-sm mt-1">{errors.from}</p>}
            </div>

            {/* To */}
            <div className="flex flex-col">
              <div className="flex items-center border rounded-lg p-3">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="to"
                  placeholder="To (Destination)"
                  className="w-full outline-none bg-transparent"
                  value={rideDetails.to}
                  onChange={handleInputChange}
                />
              </div>
              {errors.to && <p className="text-red-500 text-sm mt-1">{errors.to}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center border rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="date"
                    name="date"
                    className="w-full outline-none bg-transparent text-gray-500"
                    value={rideDetails.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center border rounded-lg p-3">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="time"
                    name="time"
                    className="w-full outline-none bg-transparent text-gray-500"
                    value={rideDetails.time}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center border rounded-lg p-3">
                  <Users className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="number"
                    name="seats"
                    placeholder="Seats"
                    min="1"
                    max="10"
                    className="w-full outline-none bg-transparent"
                    value={rideDetails.seats}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.seats && <p className="text-red-500 text-sm mt-1">{errors.seats}</p>}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center border rounded-lg p-3">
                  <IndianRupee className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="number"
                    name="price"
                    placeholder="Total Price"
                    min="0"
                    step="10"
                    className="w-full outline-none bg-transparent"
                    value={rideDetails.price}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center border rounded-lg p-3">
                  <Car className="w-5 h-5 text-gray-400 mr-2" />
                  <select
                    name="vehicle"
                    className="w-full outline-none bg-transparent text-gray-500"
                    value={rideDetails.vehicle}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Vehicle</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="rickshaw">Rickshaw</option>
                  </select>
                </div>
                {errors.vehicle && <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>}
              </div>
              
              <div className="flex items-center border rounded-lg p-3">
                <Car className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="vehicle_model"
                  placeholder="Vehicle Model (Optional)"
                  className="w-full outline-none bg-transparent"
                  value={rideDetails.vehicle_model}
                  onChange={handleInputChange}
                />
              </div>
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
