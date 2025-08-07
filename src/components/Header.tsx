import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import Button from "./Button";
import { useAuth } from "../hooks/useAuth";
import Text3D from "./Text3D";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Find a Ride", path: "/find" },
    { label: "Offer a Ride", path: "/offer" },
    // { label: "Rides", path: "/rides" },
    { label: "My Requests", path: "/requests" },

  ];

  const isActivePath = (path: string) => location.pathname === path;

  // Animation variants for the mobile menu container
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05, // Stagger the animation of children
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  // Animation variants for individual mobile menu items
  const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 shadow-sm z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">RideShare</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <div key={item.path} className="relative px-3 py-2">
                <Link
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActivePath(item.path) ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Link>
                {isActivePath(item.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    layoutId="underline" // Magic animation for the active indicator
                  />
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => logout()}
                  >
                    Sign Out
                  </Button>
                </motion.div>
              </div>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/signin">
                    <Button variant="secondary" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 z-10" // Ensure button is above other content
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <nav className="flex flex-col p-4">
              {navItems.map((item) => (
                <motion.div key={item.path} variants={mobileMenuItemVariants}>
                  <Link
                    to={item.path}
                    className={`block py-3 text-sm font-medium transition-colors hover:text-blue-600 ${
                      isActivePath(item.path)
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="border-t my-4" />
              {isAuthenticated ? (
                <>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 py-3 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={mobileMenuItemVariants}
                    className="mt-2"
                  >
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </motion.div>
                </>
              ) : (
                <div className="space-y-2">
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}