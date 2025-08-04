import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, ArrowLeft, Minus, Plus, User } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import { toast } from 'react-hot-toast';

interface RideDetails {
  _id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  totalCost: number;
  seatsAvailable: number;
  vehicleType: string;
  vehicleModel?: string;
  createdBy: {
    id: string;
    name: string;
  };
  rideStatus: string;
}

export default function BookRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const rideDetails = location.state?.rideDetails as RideDetails | undefined;

  useEffect(() => {
    if (!rideDetails) {
      toast.error('No ride details found. Redirecting...');
      navigate('/find');
    }
  }, [rideDetails, navigate]);
  
  const [seatsRequested, setSeatsRequested] = useState(1);

  if (!rideDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ride details...</p>
        </div>
      </div>
    );
  }

  const handleRequestRide = async () => {
    if (!user?.id) {
      toast.error('Please sign in to request a ride');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // NOTE: The API call remains the same
      const response = await apiClient.sendRideRequest(rideDetails._id, user.id);
      
      // FIX: Handle both success and business logic failures gracefully
      if (response.success) {
        toast.success(response.message);
        setTimeout(() => navigate('/requests'), 1500);
      } else {
        // This will show messages like "You cannot book your own ride."
        toast.error(response.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error('Error requesting ride:', error);
      // This catches network errors or 500 server errors
      const errorMessage = error.response?.data?.message || 'Failed to send ride request. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleSeatChange = (amount: number) => {
    setSeatsRequested(prev => {
      const newSeats = prev + amount;
      if (newSeats < 1) return 1;
      if (newSeats > rideDetails.seatsAvailable) {
        toast.error(`Only ${rideDetails.seatsAvailable} seats are available.`);
        return rideDetails.seatsAvailable;
      }
      return newSeats;
    });
  };
  
  const totalPrice = (rideDetails.totalCost * seatsRequested).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Results
        </button>

        <h1 className="text-3xl font-bold text-center mb-8">Request a Ride</h1>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Ride Details Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Ride Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">{rideDetails.source}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">{rideDetails.destination}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-gray-700 pt-2">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{new Date(rideDetails.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{rideDetails.time}</span>
                </div>
              </div>
                 <div className="flex items-center pt-2 border-t mt-2">
                <User className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Ride Created By</p>
                  {/* FIX: Use optional chaining to prevent crash if createdBy is undefined */}
                  <p className="font-medium">{rideDetails.createdBy?.name || 'A driver'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Selection & Price */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Seats & Price</h2>
            <div className="flex items-center justify-between">
                <label className="block font-medium text-gray-700">How many seats?</label>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => handleSeatChange(-1)} disabled={seatsRequested <= 1}>
                        <Minus className="h-4 w-4"/>
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{seatsRequested}</span>
                    <Button variant="outline" size="sm" onClick={() => handleSeatChange(1)} disabled={seatsRequested >= rideDetails.seatsAvailable}>
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
                 <div className="flex justify-between">
                    <span className="text-gray-600">Price per seat</span>
                    <span>₹{rideDetails.totalCost.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total Price</span>
                    <span>₹{totalPrice}</span>
                </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6">
            <Button 
              className="w-full"
              onClick={handleRequestRide}
              disabled={loading}
            >
              {loading ? 'Sending Request...' : `Send Ride Request`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}