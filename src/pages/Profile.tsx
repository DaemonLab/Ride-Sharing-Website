import { useEffect, useState, useCallback } from "react";
import {
  User,
  Clock,
  MapPin,
  Mail,
  Camera,
  Calendar,
  Car,
  AlertCircle,
  RefreshCw,
  Settings,
  LogOut,
  Phone,
  Edit3,
} from "lucide-react";
import Button from "../components/Button";
import { UserProfile } from "../types";
import apiClient, { Ride } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Loading skeleton component
const RideSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="ml-2 h-6 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
      <div className="w-16 h-8 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// Error component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center">
      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
      <span className="text-red-700">{message}</span>
    </div>
    {onRetry && (
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={onRetry}
        className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    )}
  </div>
);

// Empty state component
const EmptyState = ({ 
  type, 
  onCreateRide 
}: { 
  type: 'upcoming' | 'history'; 
  onCreateRide?: () => void;
}) => (
  <div className="text-center py-12">
    <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {type === 'upcoming' ? 'No upcoming rides' : 'No ride history'}
    </h3>
    <p className="text-gray-500 mb-6">
      {type === 'upcoming' 
        ? "You don't have any upcoming rides scheduled." 
        : "You haven't completed any rides yet."}
    </p>
    {type === 'upcoming' && onCreateRide && (
      <Link to="/create-ride">
        <Button variant="primary">
          Create Your First Ride
        </Button>
      </Link>
    )}
  </div>
);

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'rides' | 'history'>('rides');
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [ridesError, setRidesError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    userID: "",
    name: "",
    email: "",
    photoUrl: "",
  });
  
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);
  const [cancelingRides, setCancelingRides] = useState<Set<string>>(new Set());

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setProfileError(null);
      const response = await fetch(`${API_URL}/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }      
      const data = await response.json();
      setProfile({
        userID: data.id,
        name: data.name || 'Unknown User',
        email: data.email || '',
        photoUrl: data.picture || '',
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
    }
  }, []);

  // Fetch rides data
  const fetchRides = useCallback(async (userID: string) => {
    if (!userID) return;
    
    try {
      setRidesError(null);
      const [upcoming, completed] = await Promise.all([
        apiClient.getUpcomingRides(userID),
        apiClient.getCompletedRides(userID),
      ]);
      
      setUpcomingRides(upcoming || []);
      setCompletedRides(completed || []);
    } catch (error) {
      console.error("Error fetching rides data:", error);
      setRidesError('Failed to load rides data');
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const initializeProfile = async () => {
      setIsLoading(true);
      await fetchProfile();
      setIsLoading(false);
    };
    
    initializeProfile();
  }, [fetchProfile]);

  // Fetch rides when profile is loaded
  useEffect(() => {
    if (profile.userID) {
      fetchRides(profile.userID);
    }
  }, [profile.userID, fetchRides]);

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfile();
    if (profile.userID) {
      await fetchRides(profile.userID);
    }
    setIsRefreshing(false);
  };

  const handleCancelParticipation = async (rideId: string) => {
    if (!profile.userID || !rideId) return;
    
    setCancelingRides(prev => new Set(prev).add(rideId));
    
    try {
      const response = await apiClient.cancelRideParticipation(rideId, profile.userID);
      if (response.success) {
        toast.success('Successfully canceled ride participation');
        setUpcomingRides(prev => prev.filter(ride => ride._id !== rideId));
      }
    } catch (error) {
      console.error('Cancel participation error:', error);
      toast.error('Failed to cancel participation');
    } finally {
      setCancelingRides(prev => {
        const newSet = new Set(prev);
        newSet.delete(rideId);
        return newSet;
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-300"></div>
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-center -mt-12">
                  <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                  <div className="mt-4 sm:mt-0 sm:ml-6">
                    <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile error state
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ErrorMessage 
              message={profileError} 
              onRetry={() => {
                setProfileError(null);
                fetchProfile();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const totalRides = upcomingRides.length + completedRides.length;

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
                >
                  <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                
              </div>
            </div>
            
            <div className="px-6 pb-6">
              <div className=" relative z-10 flex flex-col sm:flex-row items-center -mt-16">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center relative group cursor-pointer">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-12  sm:mt-0 sm:ml-6 text-center sm:text-left flex-1 ">
                  <div className="flex items-center justify-center sm:justify-start">
                    <h1 className="text-3xl font-bold text-gray-800">
                      {profile.name}
                    </h1>
                    
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start mt-3 space-x-6">
                    <div className="flex items-center text-gray-600">
                      <Car className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-medium">{totalRides}</span>
                      <span className="ml-1 text-sm">
                        {totalRides === 1 ? 'Ride' : 'Rides'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium">{upcomingRides.length}</span>
                      <span className="ml-1 text-sm">Upcoming</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Mail className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="truncate">{profile.email}</span>
                </div>
                {/* You can add more profile fields here */}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 bg-white rounded-xl shadow-md">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "rides"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("rides")}
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Upcoming Rides
                    {upcomingRides.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {upcomingRides.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "history"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ride History
                    {completedRides.length > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {completedRides.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="p-6">
              {ridesError ? (
                <ErrorMessage 
                  message={ridesError}
                  onRetry={() => profile.userID && fetchRides(profile.userID)}
                />
              ) : activeTab === "rides" ? (
                <div className="space-y-4">
                  {upcomingRides.length > 0 ? (
                    upcomingRides.map((ride) => (
                      <div
                        key={ride._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-blue-200 bg-gradient-to-r from-white to-blue-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center text-lg font-semibold text-gray-800">
                              <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                              <span>
                                {ride.source} → {ride.destination}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-green-500" />
                                <span>{new Date(ride.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                <span>{ride.time}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancelParticipation(ride._id)}
                            disabled={cancelingRides.has(ride._id)}
                            className="ml-4 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {cancelingRides.has(ride._id) ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Canceling...
                              </>
                            ) : (
                              'Cancel'
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState type="upcoming" />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {completedRides.length > 0 ? (
                    completedRides.map((ride) => (
                      <div
                        key={ride._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all bg-gradient-to-r from-white to-green-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center text-lg font-semibold text-gray-800">
                              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                              <span>
                                {ride.source} → {ride.destination}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{new Date(ride.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{ride.time}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Completed
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState type="history" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}