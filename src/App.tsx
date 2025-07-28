import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Find from "./pages/Find";
import Offer from "./pages/Offer";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Safety from "./pages/Safety";
import BookRide from "./pages/BookRide";
import BookingSuccess from "./pages/BookingSuccess";
import GroupMembers from "./pages/GroupMembers";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ParallaxProvider } from "react-scroll-parallax";

function App() {
  return (
    <AuthProvider>
      <ParallaxProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/safety" element={<Safety />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/find" element={<Find />} />
                  <Route path="/offer" element={<Offer />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/book-ride" element={<BookRide />} />
                  <Route path="/booking-success" element={<BookingSuccess />} />
                </Route>
                <Route path="/group-members" element={<GroupMembers />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ParallaxProvider>
    </AuthProvider>
  );
}

export default App;
