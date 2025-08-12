// REMOVED: BrowserRouter and AuthProvider are no longer needed here
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dummy from "./pages/Dummy";
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
import Requests from "./pages/Requests";
import ThisRide from "./pages/Ride";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  // The AuthProvider and Router wrappers have been removed from this file
  return (
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
            <Route path="/requests" element={<Requests />} />
            <Route path="/ride/:rideId" element={<ThisRide />} />
          </Route>
          <Route path="/dummy" element={<Dummy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;