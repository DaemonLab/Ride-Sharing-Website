import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import Button from "./Button";
import GradientText from "./ui/GradientText";
import "../index.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = false; // Replace with actual auth state

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Find a Ride", path: "/find" },
    { label: "Offer a Ride", path: "/offer" },
    { label: "Groups", path: "/group-members" },
    { label: "Profile", path: "/profile" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className="fixed w-full bg-white shadow-sm z-50 ">
      <div className="container mx-auto px-4 ">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={5}
              showBorder={false}
              className="text-2xl custom-text"
            >
              RideShare
            </GradientText>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div>
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 custom-text ${
                    isActivePath(item.path) ? "text-blue-600" : "text-gray-600"
                  }`}   
                >
                  {item.label}
                </Link>
                {/* <div className=" border-blue-600 " /> */}
              </div>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Add logout logic here
                    // navigate('/');
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActivePath(item.path) ? "text-blue-600" : "text-gray-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                  <Button className="w-full">Sign Up</Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
