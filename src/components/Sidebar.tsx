import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Plus, LogOut } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/find', icon: Search, label: 'Find Ride' },
    { path: '/offer', icon: Plus, label: 'Offer Ride' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-4 flex flex-col 
                    shadow-[0_0_15px_rgba(62,184,255,0.3)] transition-all duration-300">
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 
                       bg-clip-text text-transparent">RideShare</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-600 shadow-[0_0_10px_rgba(62,184,255,0.5)]' 
                      : 'hover:bg-gray-800'
                    }
                    ${isHovered === item.path 
                      ? 'shadow-[0_0_15px_rgba(62,184,255,0.3)]' 
                      : ''
                    }`}
                  onMouseEnter={() => setIsHovered(item.path)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-colors duration-300
                    ${isActive ? 'text-white' : 'text-gray-400'}`} 
                  />
                  <span className={`transition-colors duration-300
                    ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-4 border-t border-gray-700">
        <button 
          className="flex items-center px-4 py-3 w-full rounded-lg text-gray-400 
                     hover:bg-gray-800 transition-all duration-300
                     hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          onClick={() => {/* Add logout logic */}}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}