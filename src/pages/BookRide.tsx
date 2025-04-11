import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Calendar, Clock, User, CreditCard, MessageCircle, Car } from 'lucide-react';
import Button from '../components/Button';

interface RideDetails {
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

export default function BookRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const rideDetails = location.state?.rideDetails as RideDetails;

  useEffect(() => {
    if (!rideDetails) {
      navigate('/find');
    }
  }, [navigate, rideDetails]);

  if (!rideDetails) {
    return <div>Loading...</div>;
  }

  const handleBooking = () => {
    navigate('/booking-success', {
      state: {
        bookingDetails: {
          ...rideDetails,
          paymentMethod
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Confirm Your Ride</h1>

        <div className="max-w-2xl mx-auto">
          {/* Ride Details Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Ride Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">{rideDetails.from}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">{rideDetails.to}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{rideDetails.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{rideDetails.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium">{rideDetails.vehicle}</h3>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center mt-2">
                    <Car className="w-4 h-4 mr-1" />
                    <span>{rideDetails.vehicle_model}</span>
                  </div>
                  <p className="mt-1">Available Seats: {rideDetails.seats}</p>
                  <p className="mt-1">Status: {rideDetails.isBooked ? 'Pre-booked' : 'Not Pre-booked'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}