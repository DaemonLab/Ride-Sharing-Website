import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Find from './pages/Find';
import Offer from './pages/Offer';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Contact from './pages/Contact';
import Safety from './pages/Safety';
import BookRide from './pages/BookRide';
import BookingSuccess from './pages/BookingSuccess';
import GroupMembers from './pages/GroupMembers';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        {/* <Sidebar/> */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find" element={<Find />} />
            <Route path="/offer" element={<Offer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/book-ride" element={<BookRide />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/group-members" element={<GroupMembers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;