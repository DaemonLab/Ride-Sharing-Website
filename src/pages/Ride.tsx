import React, { useState, useEffect, useRef } from 'react';
import apiClient, { Ride } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { MapPin, Calendar, Clock, Users, User, DollarSign, Car, ShieldCheck, Send, Loader, ChevronDown } from 'lucide-react';



const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
  withCredentials: true,
  autoConnect: false 
});


interface ChatMessage {
  rideId: string;
  user_id: string;
  name: string;
  message: string;
  timestamp: string;
}

interface ChatMember {
  id: string; // The backend model uses 'id'
  name: string; // The backend model uses 'name'
}

const ThisRide = ({ rideId }: { rideId: string }) => {
  // --- RIDE DETAILS STATE ---
  const [ride, setRide] = useState<Ride | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- CHAT STATE & LOGIC (Merged from RideChat) ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING & SOCKET CONNECTION ---
  useEffect(() => {
    if (rideId) {
      // Fetch ride details via HTTP
      const getRideDetails = async () => {
        setLoading(true);
        try {
          const response = await apiClient.getRideById(rideId);
          setRide(response);
        } catch (err) {
          setError('Failed to load ride details.');
          console.error('Error fetching ride:', err);
        } finally {
          setLoading(false);
        }
      };
      getRideDetails();

      // Connect and set up socket listeners for chat
      socket.connect();
      socket.emit('joinRoom', rideId);

      socket.on('ride members', (memberList: ChatMember[]) => {
        setMembers(memberList);
      });

      socket.emit("getOlderMessages", rideId);
      socket.on("older messages", (fetchedMessages: ChatMessage[]) => {
        setMessages(fetchedMessages);
      });

      socket.on('chat message', (msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
      });

      // Cleanup function to disconnect socket and remove listeners
      return () => {
        socket.emit('leaveRoom', rideId);
        socket.off('ride members');
        socket.off('older messages');
        socket.off('chat message');
        socket.disconnect();
      };
    }
  }, [rideId]);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // --- HANDLER FUNCTIONS ---
  const handleRequestRide = async () => { /* ... same as before ... */ };
  
  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !user) return;

    const messageData = {
      rideId: rideId,
      user: { id: user.id, name: user.name },
      message: trimmedMessage,
    };

    socket.emit('chat message', messageData);
    setNewMessage('');
  };


  // --- DERIVED STATE & RENDER LOGIC ---
  if (loading) return <div className="text-center p-10"><Loader className="animate-spin mx-auto w-8 h-8 text-blue-500" /></div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!ride) return <div className="text-center p-10">Ride not found.</div>;

  const isUserCreator = user && ride && user.id === ride.createdBy.id;
  const isUserPassenger = user && ride && members.some(m => m.id === user.id) && !isUserCreator;
  const isUserPartOfRide = isUserCreator || isUserPassenger;

  // --- JSX ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto mt-12">
      {/* Ride Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{ride.source} to {ride.destination}</h1>
        {/* ... other header details */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Map & Ride Details) */}
        <div className="lg:col-span-2 space-y-8">
          {/* ... Map Placeholder and Ride Details sections are the same as before ... */}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          {/* Ride Host Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Ride Host</h3>
            <div className="flex items-center space-x-4">
              <User className="w-12 h-12 bg-gray-200 p-2 rounded-full text-gray-600" />
              <div>
                <p className="font-semibold text-gray-800">{ride.createdBy.name}</p>
                <a href="#" className="text-sm text-blue-600 hover:underline">View Profile</a>
              </div>
            </div>
          </div>

          {/* --- CONDITIONAL UI: Show Chat for Members, Show Passengers/Actions for Others --- */}
          {isUserPartOfRide ? (
            // --- LIVE CHAT UI (for members) ---
            <div className="bg-white shadow-lg rounded-xl border border-blue-100 h-[60vh] flex flex-col">
              {/* Members Dropdown */}
              <div className="px-4 pt-4 text-sm text-gray-600 pb-2 border-b relative">
                <button onClick={() => setShowMembers(!showMembers)} className="flex items-center gap-1 font-medium hover:text-blue-600">
                  Ride Members ({members.length})
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMembers ? 'rotate-180' : ''}`} />
                </button>
                {showMembers && (
                  <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg p-2 w-56">
                    {members.map((m) => (
                      <div key={m.id} className="text-sm text-gray-800 p-1 hover:bg-blue-50 rounded">{m.name}</div>
                    ))}
                  </div>
                )}
              </div>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-xs break-words ${msg.user_id === user?.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border'}`}>
                      <div className="text-sm mb-1 font-semibold">{msg.user_id === user?.id ? 'You' : msg.name}</div>
                      <div>{msg.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {/* Message Input */}
              <div className="px-4 py-3 border-t flex items-center gap-2">
                <input type="text" placeholder="Type your message..." className="flex-1 border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          ) : (
            // --- PUBLIC VIEW (for non-members) ---
            <>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Passengers</h3>
                <p className="text-sm text-gray-500">You must be a member of the ride to see passengers and join the chat.</p>
              </div>
              <div className="mt-6">
                {ride.seatsAvailable > 0 && ride.rideStatus === 'Pending' ? (
                  <button onClick={handleRequestRide} className="w-full">Request to Join</button>
                ) : (
                  <button className="w-full" disabled>Ride is Full or Unavailable</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ThisRide;