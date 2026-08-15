import { useLocation, useNavigate } from 'react-router-dom';
import { User, MapPin, Calendar, Clock } from 'lucide-react';
import Button from '../components/Button';

interface Member {
  name: string;
  joinedAt: string;
  pickupPoint: string;
}

interface GroupDetails {
  from: string;
  to: string;
  date: string;
  time: string;
  vehicle: string;
  vehicle_model: string;
  totalSeats: number;
  members: Member[];
}

export default function GroupMembers() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupDetails: GroupDetails = location.state?.groupDetails || {
    from: "Campus",
    to: "Downtown",
    date: "2025-03-01",
    time: "14:00",
    vehicle: "SUV",
    vehicle_model: "Honda CR-V",
    totalSeats: 4,
    members: [
      { name: "John Doe", joinedAt: "2024-02-20 10:30", pickupPoint: "Main Gate" },
      { name: "Jane Smith", joinedAt: "2024-02-20 11:15", pickupPoint: "Library" },
      { name: "Mike Johnson", joinedAt: "2024-02-20 12:00", pickupPoint: "Cafeteria" },
    ]
  };

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-primary/10 blur-[110px] top-16 -left-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 text-ink">
          Ride Group Members
        </h1>

        {/* Ride Details Summary */}
        <div className="max-w-2xl mx-auto glass-strong rounded-md p-6 mb-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center text-ink font-medium">
                <MapPin className="w-5 h-5 text-primary mr-2 shrink-0" />
                <span>{groupDetails.from} → {groupDetails.to}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-ink-variant">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{groupDetails.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>{groupDetails.time}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-ink-variant pt-3 border-t border-white/60">
              <span>{groupDetails.vehicle} • {groupDetails.vehicle_model}</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-dark border border-primary/30 text-xs font-medium">
                {groupDetails.members.length}/{groupDetails.totalSeats} seats filled
              </span>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-lg font-semibold mb-4 text-ink">
            Members ({groupDetails.members.length})
          </h2>
          <div className="space-y-3">
            {groupDetails.members.map((member, index) => (
              <div key={index} className="glass-card rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-ink">{member.name}</h3>
                    <div className="text-sm text-ink-variant">
                      <p>Pickup: {member.pickupPoint}</p>
                      <p>Joined: {new Date(member.joinedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="max-w-2xl mx-auto mt-8">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/find')}
          >
            Back to Rides
          </Button>
        </div>
      </div>
    </div>
  );
}
