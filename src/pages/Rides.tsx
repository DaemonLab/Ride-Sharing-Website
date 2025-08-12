// import React from 'react'
// import { useAuth } from '../context/AuthContext'
// import { useNavigate } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import apiClient,{Ride} from '../services/api'
// import { toast } from 'react-hot-toast';
// import {UserProfile} from '../types'

// const Rides = () => {

//     const { user } = useAuth();
//     const [activeTab, setActiveTab] = useState("rides");
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
//     const [completedRides, setCompletedRides] = useState<Ride[]>([]);
//     const [profile, setProfile] = useState<UserProfile>({
//         userID: "",
//         name: "",
//         email: "",
//         photoUrl: "",
//       });

//   useEffect(() => {
//     if (profile.userID) {
//       const fetchAllRides = async () => {
//         try {
//           const [upcoming, completed] = await Promise.all([
//             apiClient.getUpcomingRides(profile.userID),
//             apiClient.getCompletedRides(profile.userID),
//           ]);
//           setUpcomingRides(upcoming);
//           setCompletedRides(completed);
//           console.log(profile)
//         } catch (error) {
//           console.error("Error fetching rides data:", error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchAllRides();
//     }
//   }, [profile.userID]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         Loading...
//       </div>
//     );
// }

//     return (

// <div className="mt-8 bg-white rounded-xl shadow-md">
//             <div className="border-b">
//               <div className="flex">
//                 <button
//                   className={`px-6 py-3 text-sm font-medium ${
//                     activeTab === "rides"
//                       ? "border-b-2 border-blue-500 text-blue-600"
//                       : "text-gray-500"
//                   }`}
//                   onClick={() => setActiveTab("rides")}
//                 >
//                   Upcoming Rides
//                 </button>
//                 <button
//                   className={`px-6 py-3 text-sm font-medium ${
//                     activeTab === "history"
//                       ? "border-b-2 border-blue-500 text-blue-600"
//                       : "text-gray-500"
//                   }`}
//                   onClick={() => setActiveTab("history")}
//                 >
//                   Ride History
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {activeTab === "rides" ? (
//                 <div className="space-y-4">
//                   {upcomingRides.length > 0 ? (
//                     upcomingRides.map((ride) => (
//                       <div
//                         key={ride._id} 
//                         className="border rounded-lg p-4 hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <div className="flex items-center text-lg font-medium">
//                               <MapPin className="w-5 h-5 text-blue-500" />
//                               <span className="ml-2">
//                                 {ride.source} → {ride.destination}
//                               </span>
//                             </div>
//                             <div className="mt-2 space-y-1 text-gray-600">
//                               <div className="flex items-center">
//                                 <Calendar className="w-4 h-4 mr-2" />
//                                 <span>{new Date(ride.date).toLocaleDateString()}</span>
//                               </div>
//                               <div className="flex items-center">
//                                 <Clock className="w-4 h-4 mr-2" />
//                                 <span>{ride.time}</span>
//                               </div>
//                             </div>
//                           </div>
//                           <Button variant="secondary" size="sm">
//                             Cancel
//                           </Button>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-500 text-center">No upcoming rides found.</p>
//                   )}
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {completedRides.length > 0 ? (
//                     completedRides.map((ride) => (
//                       <div
//                         key={ride._id} 
//                         className="border rounded-lg p-4 hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <div className="flex items-center text-lg font-medium">
//                               <MapPin className="w-5 h-5 text-gray-500" />
//                               <span className="ml-2">
//                                 {ride.source} → {ride.destination}
//                               </span>
//                             </div>
//                             <div className="mt-2 space-y-1 text-gray-600">
//                               <div className="flex items-center">
//                                 <Calendar className="w-4 h-4 mr-2" />
//                                 <span>{new Date(ride.date).toLocaleDateString()}</span>
//                               </div>
//                               <div className="flex items-center">
//                                 <Clock className="w-4 h-4 mr-2" />
//                                 <span>{ride.time}</span>
//                               </div>
//                             </div>
//                           </div>
//                           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
//                             Completed
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-500 text-center">No ride history.</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
        
//     );
        
// };

// export default Rides
