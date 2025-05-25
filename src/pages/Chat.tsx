import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Phone, Video, MoreVertical } from "lucide-react";
import Message from "./Message";

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

interface RideDetails {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  vehicle: string;
  vehicle_model: string;
  isBooked: boolean;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; }>({ id: '', name: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch ride details and initialize chat
    const initializeChat = async () => {
      try {
        // Get ride ID from URL or state
        const rideId = new URLSearchParams(location.search).get('rideId');
        if (!rideId) {
          navigate('/find');
          return;
        }

        // Fetch ride details
        const response = await fetch(`/api/rides/${rideId}`);
        const data = await response.json();
        setRideDetails(data);

        // Fetch chat history
        const chatResponse = await fetch(`/api/rides/${rideId}/messages`);
        const chatData = await chatResponse.json();
        setMessages(chatData);

        // Get current user details (from your auth system)
        const userResponse = await fetch('/api/user/current');
        const userData = await userResponse.json();
        setCurrentUser(userData);

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load chat data');
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [navigate, location]);

  useEffect(() => {
    // Set up WebSocket connection for real-time messages
    const ws = new WebSocket(`ws://your-backend-url/ws/chat/${rideDetails?.id}`);

    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, newMessage]);
    };

    return () => ws.close();
  }, [rideDetails]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (message.trim() && rideDetails) {
      try {
        const response = await fetch(`/api/rides/${rideDetails.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: message.trim(),
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');
        setMessage("");
      } catch (err) {
        setError('Failed to send message');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!rideDetails) return null;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-gray-50 mt-8 mx-12 border">
      {/* Chat Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {rideDetails.vehicle_model[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {rideDetails.from} to {rideDetails.to}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(rideDetails.date).toLocaleDateString()} • {rideDetails.time}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            {...msg}
            isCurrentUser={msg.sender.id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            rows={1}
          />
          <button
            onClick={handleSend}
            className={`p-3 rounded-full transition-colors ${
              message.trim()
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;