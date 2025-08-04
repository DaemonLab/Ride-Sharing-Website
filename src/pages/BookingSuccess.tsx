import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle, MapPin, Calendar, Clock } from 'lucide-react';
import Button from '../components/Button';

// MODIFICATION: Interface updated to match the main Ride interface for consistency
interface BookingDetails {
  _id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  totalCost: number;
  vehicleType: string;
  vehicleModel?: string;
  // This can be passed if a request is accepted and a booking record is created
  bookingId?: string; 
}

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state?.bookingDetails as BookingDetails | undefined;

  // If no details are found, redirect to the home page or profile.
  if (!bookingDetails) {
      // You can add a redirect here
      // navigate('/'); 
      return (
        <div className="min-h-screen flex items-center justify-center">
            <p>No booking details found.</p>
        </div>
      );
  }

  // MODIFICATION: Removed client-side bookingId generation. It should come from the state if it exists.
  const { bookingId } = bookingDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Your ride has been successfully confirmed. The ride creator has been notified.
            </p>

            {/* MODIFICATION: Using corrected properties from bookingDetails */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-left space-y-3">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">From - To</p>
                    <p className="font-medium">{bookingDetails.source} → {bookingDetails.destination}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{new Date(bookingDetails.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{bookingDetails.time}</p>
                  </div>
                </div>
                {bookingId && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="font-mono font-medium">{bookingId}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => navigate('/profile/my-rides')}
              >
                View My Rides
              </Button>
              
              <Button 
                variant="secondary"
                className="w-full flex items-center justify-center"
                onClick={() => navigate('/home')}
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