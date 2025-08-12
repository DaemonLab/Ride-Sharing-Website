import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";


const RideIllustration = () => (
  <svg viewBox="0 0 578 439" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M411.333 438.5C502.433 438.5 577.5 363.433 577.5 272.333C577.5 181.233 502.433 106.167 411.333 106.167C320.233 106.167 245.167 181.233 245.167 272.333C245.167 363.433 320.233 438.5 411.333 438.5Z"
      fill="#E6E6E6"
    />
    <path
      d="M291.5 438.5H1V200.5C1 145.272 45.7715 100.5 101 100.5H291.5V438.5Z"
      fill="#4392F1"
    />
    <path
      d="M501 321.5H364"
      stroke="white"
      strokeWidth="4"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M375 292.5H490"
      stroke="white"
      strokeWidth="4"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M364 263.5H501"
      stroke="white"
      strokeWidth="4"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M228.333 346.833C253.333 346.833 273.5 326.667 273.5 301.667C273.5 276.667 253.333 256.5 228.333 256.5C203.333 256.5 183.167 276.667 183.167 301.667C183.167 326.667 203.333 346.833 228.333 346.833Z"
      fill="#FFC93C"
      stroke="#1C4B82"
      strokeWidth="2"
    />
    <path
      d="M90.3333 346.833C115.333 346.833 135.5 326.667 135.5 301.667C135.5 276.667 115.333 256.5 90.3333 256.5C65.3333 256.5 45.1666 276.667 45.1666 301.667C45.1666 326.667 65.3333 346.833 90.3333 346.833Z"
      fill="#FFC93C"
      stroke="#1C4B82"
      strokeWidth="2"
    />
    <path d="M273 301.5H135" stroke="#1C4B82" strokeWidth="2" />
    <path d="M1 332.5H291" stroke="#1C4B82" strokeWidth="2" />
    <path
      d="M183 257V181.5C183 146.979 211.479 118.5 246 118.5H356.5"
      stroke="#1C4B82"
      strokeWidth="2"
    />
    <path
      d="M45 257V155.5C45 120.979 73.4789 92.5 108 92.5H120.5"
      stroke="#1C4B82"
      strokeWidth="2"
    />
    <path d="M291 200V101" stroke="#1C4B82" strokeWidth="2" />
    <path
      d="M141.667 13C141.667 20.1667 135.833 26 128.667 26C121.5 26 115.667 20.1667 115.667 13C115.667 5.83333 121.5 0 128.667 0C135.833 0 141.667 5.83333 141.667 13Z"
      fill="#FFC93C"
    />
    <path
      d="M232.167 101.333C232.167 108.5 226.333 114.333 219.167 114.333C212 114.333 206.167 108.5 206.167 101.333C206.167 94.1667 212 88.3333 219.167 88.3333C226.333 88.3333 232.167 94.1667 232.167 101.333Z"
      fill="#FFC93C"
    />
    <path
      d="M26 84.3333C26 91.5 20.1667 97.3333 13 97.3333C5.83334 97.3333 0 91.5 0 84.3333C0 77.1667 5.83334 71.3333 13 71.3333C20.1667 71.3333 26 77.1667 26 84.3333Z"
      fill="#FFC93C"
    />
  </svg>
);

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile?redirected=true");
    }
    if (message) {
      setError(message);
    }
  }, [isAuthenticated, navigate, message]);

  const handleGoogleSignIn = () => {
    login();
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Column: Branding and Illustration */}
      <div className="hidden rounded-br-3xl lg:flex flex-col items-center justify-center bg-gradient-to-bl from-blue-600 to-blue-800 text-white p-12">
        {/* <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Link to="/" className="text-4xl font-bold">
            RideShare
          </Link>
          <p className="mt-4 text-lg text-blue-200">
            Your journey, shared. Connect with fellow students for a better commute.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            delay: 0.5,
            duration: 1,
          }}
          className="mt-12 max-w-lg w-full"
        >
          <RideIllustration />
        </motion.div> */}
        <DotLottieReact
          src="https://lottie.host/97a2424a-d376-4afa-a931-76c69622c641/GdcgeA4fGI.lottie"
          loop
          autoplay
        />
      </div>

      {/* Right Column: Sign-In Form */}
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full space-y-8"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.h2
              variants={itemVariants}
              className="mt-6 text-center text-3xl font-extrabold text-gray-900"
            >
              Welcome back!
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-2 text-center text-sm text-gray-600"
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up here
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
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
