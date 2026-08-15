import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle, MapPin, Calendar, Clock } from 'lucide-react';
import Button from '../components/Button';

interface BookingDetails {
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  vehicle: string;
  vehicle_model: string;
  bookingId: string;
}

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state?.bookingDetails as BookingDetails;

  // Generate a unique booking ID
  const bookingId = `RD${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen py-28 relative flex items-center">
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-secondary/15 blur-[100px] top-16 -right-16 pointer-events-none animate-float-slow" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto text-center">
          <div className="glass-strong rounded-md p-8">
            <div className="w-16 h-16 bg-secondary/15 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <CheckCircle className="w-9 h-9 text-secondary-dark" />
            </div>

            <h1 className="font-display text-2xl font-bold mb-3 text-ink">
              Booking Confirmed!
            </h1>
            <p className="text-ink-variant mb-6 text-sm">
              Your ride has been successfully booked. You can now join the ride group.
            </p>

            {/* Booking Details */}
            <div className="glass rounded-lg p-4 mb-6">
              <div className="text-left space-y-3">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary mr-2 shrink-0" />
                  <div>
                    <p className="text-xs text-ink-variant">From - To</p>
                    <p className="font-medium text-ink">
                      {bookingDetails.from} → {bookingDetails.to}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-primary mr-2 shrink-0" />
                  <div>
                    <p className="text-xs text-ink-variant">Date</p>
                    <p className="font-medium text-ink">{bookingDetails.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary mr-2 shrink-0" />
                  <div>
                    <p className="text-xs text-ink-variant">Time</p>
                    <p className="font-medium text-ink">{bookingDetails.time}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-outline-variant/50">
                  <p className="text-xs text-ink-variant">Booking Reference</p>
                  <p className="font-mono font-medium text-ink">{bookingId}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() =>
                  navigate('/profile', {
                    state: { bookingDetails: { ...bookingDetails, bookingId } },
                  })
                }
              >
                View Booking Details
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  navigate('/group-members', {
                    state: {
                      groupDetails: {
                        ...bookingDetails,
                        bookingId,
                        totalSeats: 4,
                        members: [
                          {
                            name: 'You',
                            joinedAt: new Date().toISOString(),
                            pickupPoint: bookingDetails.from,
                          },
                        ],
                      },
                    },
                  })
                }
              >
                <MessageCircle className="w-5 h-5" />
                See Group
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
