import { useEffect, useState } from "react";
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
import Button from "../components/Button";
import { UserProfile } from "../types";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("rides");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    studentId: "12345",
    name: "John Doe",
    email: "john.doe@example.com",
  });

  const getProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Failed to fetch profile data");
        return;
      }
      const data = await response.json();
      setProfile({
        studentId: data.id,
        name: data.name,
        email: data.email,
        photoUrl: data.picture,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
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
                    {profile.photoUrl ? (
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
                  <h1 className="text-2xl text-white font-bold">
                    {profile.name}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start mt-2 space-x-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="ml-1">4.8</span>
                    </div>
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-gray-400" />
                      <span className="ml-1">24 rides</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="ml-1">Joined 2023</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Contact Information to use profile state */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile.email}</span>
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
              {activeTab === "rides" ? (
                <div className="space-y-4">
                  {[1, 2].map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center text-lg font-medium">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span className="ml-2">Campus → Downtown</span>
                          </div>
                          <div className="mt-2 space-y-1 text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>March 1, 2024</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>2:00 PM</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center text-lg font-medium">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span className="ml-2">Downtown → Campus</span>
                          </div>
                          <div className="mt-2 space-y-1 text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>February 28, 2024</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>3:00 PM</span>
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
