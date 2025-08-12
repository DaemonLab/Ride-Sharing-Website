// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { User, MapPin, Calendar, Clock, Users } from 'lucide-react';
// import Button from '../components/Button';

// interface Member {
//   name: string;
//   joinedAt: string;
//   pickupPoint: string;
// }

// interface GroupDetails {
//   from: string;
//   to: string;
//   date: string;
//   time: string;
//   vehicle: string;
//   vehicle_model: string;
//   totalSeats: number;
//   members: Member[];
// }

// export default function GroupMembers() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const groupDetails = location.state?.groupDetails || {
//     from: "Campus",
//     to: "Downtown",
//     date: "2025-03-01",
//     time: "14:00",
//     vehicle: "SUV",
//     vehicle_model: "Honda CR-V",
//     totalSeats: 4,
//     members: [
//       { name: "John Doe", joinedAt: "2024-02-20 10:30", pickupPoint: "Main Gate" },
//       { name: "Jane Smith", joinedAt: "2024-02-20 11:15", pickupPoint: "Library" },
//       { name: "Mike Johnson", joinedAt: "2024-02-20 12:00", pickupPoint: "Cafeteria" },
//     ]
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 mt-8">
//       <div className="container mx-auto px-4">
//         <h1 className="text-3xl font-bold text-center mb-8">Ride Group Members</h1>

//         {/* Ride Details Summary */}
//         <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mb-6">
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <MapPin className="w-5 h-5 text-gray-400 mr-2" />
//                 <span>{groupDetails.from} → {groupDetails.to}</span>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center">
//                   <Calendar className="w-5 h-5 text-gray-400 mr-2" />
//                   <span>{groupDetails.date}</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Clock className="w-5 h-5 text-gray-400 mr-2" />
//                   <span>{groupDetails.time}</span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center justify-between text-sm text-gray-600">
//               <span>{groupDetails.vehicle} • {groupDetails.vehicle_model}</span>
//               <span>{groupDetails.members.length}/{groupDetails.totalSeats} seats filled</span>
//             </div>
//           </div>
//         </div>

//         {/* Members List */}
//         <div className="max-w-2xl mx-auto">
//           <h2 className="text-xl font-semibold mb-4">Members ({groupDetails.members.length})</h2>
//           <div className="space-y-4">
//             {groupDetails.members.map((member, index) => (
//               <div key={index} className="bg-white rounded-xl shadow-md p-4">
//                 <div className="flex items-center">
//                   <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
//                     <User className="w-6 h-6 text-gray-400" />
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="font-medium">{member.name}</h3>
//                     <div className="text-sm text-gray-500">
//                       <p>Pickup: {member.pickupPoint}</p>
//                       <p>Joined: {new Date(member.joinedAt).toLocaleString()}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Back Button */}
//         <div className="max-w-2xl mx-auto mt-8">
//           <Button 
//             variant="secondary"
//             className="w-full"
//             onClick={() => navigate('/find')}
//           >
//             Back to Rides
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }