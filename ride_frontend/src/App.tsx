import { lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ParallaxProvider } from "react-scroll-parallax";

// Route-level code splitting — each page is only downloaded when the user navigates to it.
// This replaces the single 965 KB bundle with smaller on-demand chunks.
const Home         = lazy(() => import("./pages/Home"));
const Find         = lazy(() => import("./pages/Find"));
const Offer        = lazy(() => import("./pages/Offer"));
const Profile      = lazy(() => import("./pages/Profile"));
const SignIn       = lazy(() => import("./pages/SignIn"));
const About        = lazy(() => import("./pages/About"));
const Contact      = lazy(() => import("./pages/Contact"));
const Safety       = lazy(() => import("./pages/Safety"));
const BookRide     = lazy(() => import("./pages/BookRide"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const GroupMembers = lazy(() => import("./pages/GroupMembers"));
const Chat         = lazy(() => import("./pages/Chats"));

/** Minimal full-screen spinner shown while a page chunk is loading */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Note: manual Sign Up was removed — the backend only supports Google OAuth
// (see ride_backend/src/routes/loginRoutes.js), so /signup now redirects to /signin.
function App() {
  return (
    <ParallaxProvider>
      <Router>
        {/* AuthProvider is inside Router so it can use useLocation()
            to detect the ?status=success redirect from Google OAuth */}
        <AuthProvider>
          <div className="lumina-bg min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow relative z-10">
              {/* Suspense displays PageLoader while a lazy chunk is being fetched */}
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<Navigate to="/signin" replace />} />
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
                  <Route element={<ProtectedRoute />}>
                    <Route path="/rides/:rideID/group" element={<GroupMembers />} />
                  </Route>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/chat/:rideID" element={<Chat />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ParallaxProvider>
  );
}

export default App;
