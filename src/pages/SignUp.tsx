import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login, loading } = useAuth();



  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/profile?redirected=true");
    }
    if (message) {
      setError(message);
    }
  }, [isAuthenticated, loading, navigate, message]);

  const handleGoogleSignUp = () => {
    login();
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.8, // Delay form animation to sync with the left panel
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 ">
      {/* --- Left Column: The Animated Scene --- */}
      <div className="hidden rounded-br-3xl lg:flex flex-col items-center justify-center bg-gradient-to-bl from-blue-600 to-blue-800 text-white p-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center z-10"
        >
          <Link to="/" className="text-5xl font-bold text-white tracking-wide">
            RideShare
          </Link>
          <p className="mt-4 text-lg text-green-200">
            Join the community and start your journey with us.
          </p>
        </motion.div>
        
        <motion.div
          className="w-full max-w-md mt-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 10,
            delay: 0.2,
          }}
        >
          <DotLottieReact
          src="https://lottie.host/97a2424a-d376-4afa-a931-76c69622c641/GdcgeA4fGI.lottie"
          loop
            autoplay
          />
        </motion.div>
      </div>

      {/* --- Right Column: Sign-Up Form --- */}
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full space-y-8"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.h2 variants={itemVariants} className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </div>

          <motion.div variants={itemVariants}>
            {error && (
              <div className="my-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-lg">
                {error}
              </div>
            )}
            <motion.button
              onClick={handleGoogleSignUp}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              whileHover={{ scale: 1.02, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}