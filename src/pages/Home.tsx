import { Car, Users, Leaf, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ThreeScene from "../components/ThreeScene";
import GradientText from "../components/ui/GradientText"

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className=" bg-[url(/src/assets/back.png)] bg-cover min-h-screen flex items-center justify-center bg-cover bg-center ">
        <div className="container mx-auto px-4 text-white ">

        <GradientText
              colors={["#60ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={5}
              showBorder={false}
              className="text-4xl custom-text md:text-6xl font-bold mb-6"
            >
              Share Rides, Share Stories
            </GradientText>
          {/* <h1 className=" text-4xl text-blue-600 md:text-6xl font-bold mb-6">
            Share Rides, Share Stories
          </h1> */}
          {/* <p className="text-xl md:text-2xl text-blue-400 mb-8 max-w-2xl mx-auto">
            Connect with fellow students for affordable rides
          </p> */}
          {/* <hr className=" w-1/2 h-1 bg-blue-600 border-0 my-4" /> */}



          
          <div className=" flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/find")}
              className="hover:scale-105 transition-transform"
            >
              Find a Ride
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/offer")}
              className="hover:scale-105 transition-transform border"
            >
              Offer a Ride
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-t from-gray-50 to-sky-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose RideShare?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Car className="w-8 h-8" />,
                title: "Cost Sharing",
                description: "Split travel expenses with fellow students",
              },
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "Eco-Friendly",
                description: "Reduce carbon footprint by sharing rides",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Socialize",
                description: "Meet new friends during your commute",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Safety",
                description: "Verified college students only",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="inline-block p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {[
              {
                step: 1,
                title: "Sign In",
                description: "Login with your college ID",
              },
              {
                step: 2,
                title: "Find/Offer",
                description: "Post or search for rides",
              },
              {
                step: 3,
                title: "Connect",
                description: "Match and travel together",
              },
            ].map((step, index) => (
              <div key={index} className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
