import { Shield, Bell } from 'lucide-react';

export default function Safety() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6">Your Safety is Our Priority</h1>
          <p className="text-xl text-gray-600">
            We've implemented comprehensive safety measures to ensure secure rides for all our users.
          </p>
        </div>

        {/* Safety Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: <Shield className="w-12 h-12 text-blue-600" />,
              title: "Verified Users",
              description: "All users must verify their college ID and complete a background check."
            },
            {
              icon: <Bell className="w-12 h-12 text-blue-600" />,
              title: "Real-time Alerts",
              description: "Get instant notifications about your ride and share your trip status with trusted contacts."
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Safety Tips */}
        <div className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Safety Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Verify your driver's identity before entering the vehicle",
              "Share your trip details with friends or family",
              "Travel in groups when possible",
              "Keep your personal information private",
              "Trust your instincts and report suspicious behavior",
              "Stay in well-lit and populated areas"
            ].map((tip, index) => (
              <div key={index} className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 mt-1">
                  {index + 1}
                </div>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}