// // Ride Sharing/src/pages/Ride.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom'; // Import useParams
// import apiClient, { Ride } from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import { motion } from 'framer-motion';
// import { toast } from 'react-hot-toast';
// import { MapPin, Calendar, Clock, User, Loader } from 'lucide-react';
// import RideChat from '../components/RideChat';



// // FIX: Renamed component to ThisRide to match usage in App.tsx
// const ThisRide = () => {
//   const { rideId } = useParams<{ rideId: string }>();
//   const { user } = useAuth();
//   const [ride, setRide] = useState<Ride | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (rideId) {
//       const getRideDetails = async () => {
//         setLoading(true);
//         try {
//           const response = await apiClient.getRideById(rideId);
//           setRide(response);
//         } catch (err) {
//           setError('Failed to load ride details.');
//           console.error('Error fetching ride:', err);
//         } finally {
//           setLoading(false);
//         }
//       };
//       getRideDetails();
//     }
//   }, [rideId]);

//   if (loading) return <div className="text-center p-10"><Loader className="animate-spin mx-auto w-8 h-8 text-blue-500" /></div>;
//   if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
//   if (!ride) return <div className="text-center p-10">Ride not found.</div>;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto mt-16 p-4">
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold text-gray-800">{ride.source} to {ride.destination}</h1>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-8">
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h3 className="text-xl font-bold mb-4">Ride Details</h3>
//             <div className="text-gray-700">
//               <div className="flex items-center mb-2"><MapPin className="w-5 h-5 mr-2" />From: {ride.source}</div>
//               <div className="flex items-center mb-2"><MapPin className="w-5 h-5 mr-2" />To: {ride.destination}</div>
//               <div className="flex items-center mb-2"><Calendar className="w-5 h-5 mr-2" />Date: {new Date(ride.date).toLocaleDateString()}</div>
//               <div className="flex items-center mb-2"><Clock className="w-5 h-5 mr-2" />Time: {new Date(ride.time).toLocaleTimeString()}</div>
//               {/* Add more ride details as needed */}
//             </div>
//           </div>
//         </div>
//         <div className="space-y-8">
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h3 className="text-xl font-bold mb-4">Ride Host</h3>
//             <div className="flex items-center space-x-4">
//               <User className="w-12 h-12 bg-gray-200 p-2 rounded-full text-gray-600" />
//               <div className="text-gray-700">
//                 <p className="font-semibold text-gray-800">{ride.createdBy.name}</p>
//                 {/* Link to user profile could be added here */}
//               </div>
//             </div>
//           </div>
//           {/* Ride Chat Section */}
//           {user && rideId && (
//             <RideChat rideID={rideId} userID={user.id} UserName={user.name} />
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default ThisRide;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { Ride } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Loader, 
  ArrowLeft,
  Car,
  Users,
  IndianRupee,
  Navigation,
  AlertCircle,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import RideChat from '../components/RideChat';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2 },
  },
};

const LoadingSpinner = () => (
  <motion.div
    className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const ErrorState = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center"
  >
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Go Back
      </button>
    </div>
  </motion.div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-2xl shadow-lg text-center"
    >
      <LoadingSpinner />
      <p className="mt-4 text-gray-600 font-medium">Loading ride details...</p>
    </motion.div>
  </div>
);

const ThisRide = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rideId) {
      setError('No ride ID provided');
      setLoading(false);
      return;
    }

    const getRideDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getRideById(rideId);
        if (response) {
          setRide(response);
          console.log(response);
        } else {
          throw new Error('Ride not found');
        }
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 
                           err?.message || 
                           'Failed to load ride details';
        setError(errorMessage);
        console.error('Error fetching ride:', err);
        toast.error(errorMessage, {
          icon: <AlertCircle className="w-5 h-5" />,
        });
      } finally {
        setLoading(false);
      }
    };

    getRideDetails();
  }, [rideId]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // const formatTime = (timeString: string) => {
  //   try {
  //     if (timeString.includes('T') || timeString.includes(':')) {
  //       const date = new Date(timeString);
  //       return date.toLocaleTimeString('en-US', {
  //         hour: 'numeric',
  //         minute: '2-digit',
  //         hour12: true,
  //       });
  //     }
  //     return timeString;
  //   } catch {
  //     return timeString;
  //   }
  // };

  const getRideStatus = (status: string) => {
    const statusMap = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: AlertCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!ride) return <ErrorState message="Ride not found." />;

  const statusInfo = getRideStatus(ride.rideStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 mt-12">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          },
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={cardVariants}
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </motion.button>

          {/* Status Badge */}
          <motion.div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusInfo.color}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <StatusIcon className="w-4 h-4" />
            <span className="font-medium text-sm">{statusInfo.label == "Pending" ? "Ride is not completed yet" : statusInfo.label}</span>
          </motion.div>
        </motion.div>

        {/* Page Title */}
        <motion.div className="mb-12" variants={cardVariants}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {ride.source}
            <motion.span 
              className="mx-4 text-blue-500"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              →
            </motion.span>
            {ride.destination}
          </h1>
          <p className="text-xl text-gray-600">
            {formatDate(ride.date)} at {ride.time}
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ride Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Visualization */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <Navigation className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Route Details</h2>
              </div>

              {/* Visual Route */}
              <div className="relative mb-8">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className="w-4 h-4 bg-green-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                    />
                    <motion.div 
                      className="w-0.5 h-16 bg-gradient-to-b from-green-500 to-red-500 my-3"
                      initial={{ height: 0 }}
                      animate={{ height: '4rem' }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    />
                    <motion.div 
                      className="w-4 h-4 bg-red-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 }}
                    />
                  </div>
                  <div className="flex-1 space-y-12">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-sm text-gray-500 mb-2">Pickup Location</p>
                      <p className="text-xl font-semibold text-gray-900">{ride.source}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6 }}
                    >
                      <p className="text-sm text-gray-500 mb-2">Drop-off Location</p>
                      <p className="text-xl font-semibold text-gray-900">{ride.destination}</p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Ride Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <motion.div 
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(ride.date)}</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900">{ride.time}</p>
                  </div>
                </motion.div>

                {ride.totalCost && (
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IndianRupee className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Cost</p>
                      <p className="font-semibold text-gray-900">₹{ride.totalCost}</p>
                    </div>
                  </motion.div>
                )}

                {ride.totalSeats !== undefined && (
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Seats</p>
                      <p className="font-semibold text-gray-900">{ride.totalSeats}</p>
                    </div>
                  </motion.div>
                )}

                {ride.seatsAvailable !== undefined && (
                  <motion.div 
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available Seats</p>
                      <p className="font-semibold text-gray-900">{ride.seatsAvailable}</p>
                
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Additional Ride Info */}
            {(ride.vehicleType) && (
              <motion.div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Vehicle Information</h3>
                </div>
                <div className="text-gray-700">
                  {ride.vehicleType && (
                    <p className="mb-2">
                      <span className="font-medium">Type:</span> {ride.vehicleType}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Host Info & Chat */}
          <div className="space-y-6">
            {/* Ride Host */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg mr-3">
                  <User className="w-6 h-6 text-blue-600 " />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Ride Host</h3>
              </div>
              
              <motion.div 
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  whileHover={{ rotate: 5 }}
                >
                  {ride.createdBy?.name?.charAt(0)?.toUpperCase() || 'H'}
                </motion.div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {ride.createdBy.name || 'Host'}

                  </h4>
                  <p className="text-gray-500 text-sm">Ride Creator</p>
                  {/* Add rating or other host info here if available */}
                </div>
              </motion.div>
            </motion.div>

            {/* Chat Section */}
            <AnimatePresence>
              {user && rideId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Ride Chat</h3>
                    </div>
                  </div>
                  <div className="p-0">
                    <RideChat 
                      rideID={rideId} 
                      userID={user.id} 
                      UserName={user.name || 'User'} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThisRide;