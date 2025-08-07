import { Shield, Users, Award, BookOpen } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Mission Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6">About RideShare</h1>
          <p className="text-xl text-gray-600">
            We're on a mission to make transportation more affordable, and environmentally friendly by connecting students who share similar routes.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: <Shield className="w-8 h-8 text-blue-600" />,
              title: "Safety First",
              description: "We verify all users through their college ID and maintain strict safety protocols."
            },
            {
              icon: <Users className="w-8 h-8 text-blue-600" />,
              title: "Community Driven",
              description: "Built by students, for students, fostering a trusted community of riders."
            },
            {
              icon: <Award className="w-8 h-8 text-blue-600" />,
              title: "Quality Service",
              description: "Committed to providing reliable and comfortable ride-sharing experiences."
            },
            {
              icon: <BookOpen className="w-8 h-8 text-blue-600" />,
              title: "Continuous Learning",
              description: "We constantly improve our service based on user feedback and experiences."
            }
          ].map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Abhishek Mane",
                role: "Founder & CEO",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
              },
              {
                name: "Emily Chen",
                role: "Head of Safety",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
              },
              {
                name: "Emily Rodriguez",
                role: "Community Manager",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-32 h-32 rounded-full mx-auto mb-4 bg-cover bg-center"
                  style={{ backgroundImage: `url(${member.image})` }}
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}