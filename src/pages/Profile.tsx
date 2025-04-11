import React, { useState } from 'react';
import { User, Star, Clock, MapPin, Mail, Phone, Camera, Calendar, Car, X } from 'lucide-react';
import Button from '../components/Button';

interface UserProfile {
  name: string;
  studentId: string;
  email: string;
  phone: string;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('rides');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    studentId: "12345",
    email: "john.doe@example.com",
    phone: "+1 234-567-8900"
  });

  const handleSave = () => {
    // Here you would typically make an API call to update the profile
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={profile.studentId}
                  onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header with Cover Image */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center -mt-12">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center relative group">
                    <User className="w-12 h-12 text-gray-400" />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                  <h1 className="text-2xl font-bold">John Doe</h1>
                  <p className="text-gray-600">Student ID: 12345</p>
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
                <Button 
                  className="mt-4 sm:mt-0 sm:ml-auto"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>

              {/* Update Contact Information to use profile state */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{profile.phone}</span>
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
                    activeTab === 'rides' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('rides')}
                >
                  Upcoming Rides
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  Ride History
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'rides' ? (
                <div className="space-y-4">
                  {[1, 2].map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                        <Button variant="secondary" size="sm">Cancel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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