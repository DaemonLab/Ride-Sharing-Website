import {
  User,
  Star,
  Clock,
  MapPin,
  Mail,
  Camera,
  Calendar,
  Car,
} from "lucide-react";
import { useState } from "react";
import Button from "../components/Button";
import { useProfile } from "../hooks/useProfile";
import { useRides } from "../hooks/useRides";

/**
 * UI Layer — Profile
 *
 * This page ONLY reads from hooks — no fetch(), no API_URL, no inline async logic.
 *  - useProfile()  → user's name, email, avatar
 *  - useRides('profile') → upcoming + completed rides
 */
export default function Profile() {
  const [activeTab, setActiveTab] = useState("rides");

  // Hook for user profile data
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  // Hook for the user's rides history — "profile" mode fetches both lists on mount
  const {
    upcomingRides,
    completedRides,
    loading: ridesLoading,
    error: ridesError,
  } = useRides("profile");

  const isLoading = profileLoading || ridesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{profileError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header with Cover Image */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center -mt-12">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center relative group">
                    {profile?.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                  <h1 className="text-2xl font-bold">{profile?.name}</h1>
                  <div className="flex items-center justify-center sm:justify-start mt-2 space-x-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="ml-1">4.8</span>
                    </div>
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-gray-400" />
                      <span className="ml-1">
                        {completedRides.length} rides
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="ml-1">Joined 2023</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 bg-white rounded-xl shadow-md">
            <div className="border-b">
              <div className="flex">
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "rides"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("rides")}
                >
                  Upcoming Rides
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "history"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  Ride History
                </button>
              </div>
            </div>

            <div className="p-6">
              {ridesError && (
                <p className="text-red-500 text-sm mb-4">{ridesError}</p>
              )}

              {activeTab === "rides" ? (
                <div className="space-y-4">
                  {upcomingRides.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No upcoming rides
                    </p>
                  ) : (
                    upcomingRides.map((ride, index) => (
                      <div
                        key={ride.id ?? index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center text-lg font-medium">
                              <MapPin className="w-5 h-5 text-blue-500" />
                              <span className="ml-2">
                                {ride.from ?? ride.pickup} → {ride.to ?? ride.dropoff}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1 text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{ride.date ?? ride.dateTime}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{ride.time}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="secondary" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {completedRides.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No completed rides yet
                    </p>
                  ) : (
                    completedRides.map((ride, index) => (
                      <div
                        key={ride.id ?? index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center text-lg font-medium">
                              <MapPin className="w-5 h-5 text-blue-500" />
                              <span className="ml-2">
                                {ride.from ?? ride.pickup} → {ride.to ?? ride.dropoff}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1 text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{ride.date ?? ride.dateTime}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{ride.time}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))
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
