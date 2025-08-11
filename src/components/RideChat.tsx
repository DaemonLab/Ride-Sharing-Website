import React, { useEffect, useRef, useState } from 'react';
// Import the custom hook we created
import { useSocket } from '../context/SocketContext';
import { Loader, Send, ChevronDown } from 'lucide-react';

// REMOVED: No longer need to import io or create a local socket instance.
// REMOVED: No longer need to import useAuth if userID and UserName are passed as props.
// REMOVED: No longer need to import toast, as the global context handles it.

interface RideChatProps {
  rideID: string;
  userID: string;
  UserName: string;
  isRideCompleted?: boolean;
}

interface Message {
  rideId: string;
  user_id: string | number;
  name: string;
  message: string;
  timestamp: string;
}

interface Member {
  id: string | number;
  name:string;
}

export default function RideChat({ rideID, userID, UserName, isRideCompleted = false }: RideChatProps) {
  // Use the global socket from our context
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    // Ensure we have a rideID and a connected socket before proceeding
    if (!rideID || !socket || !isConnected) {
      if(rideID && !isConnected) {
        setLoading(true); // Show loader while socket is connecting
      }
      return;
    };

    // Join the specific ride's chat room
    socket.emit('joinRoom', rideID);

    // Get the member list for this room
    socket.on('ride members', (memberList: Member[]) => {
      setMembers(memberList);
    });

    // Request older messages for this room
    socket.emit("getOlderMessages", rideID);

    socket.on("older messages", (fetchedMessages: Message[]) => {
      setMessages(fetchedMessages);
      setLoading(false);
    });

    // Listen for new messages IN THIS ROOM
    const handleChatMessage = (msg: Message) => {
        // The only job here is to add the message to the UI.
        // The global toast notification is handled by SocketContext.
        setMessages(prev => [...prev, msg]);
    };

    socket.on('chat message', handleChatMessage);

    // Cleanup function to leave the room and remove listeners
    return () => {
      socket.emit('leaveRoom', rideID);
      socket.off('ride members');
      socket.off("older messages");
      socket.off('chat message', handleChatMessage); // Important to remove the specific handler
    };
  }, [rideID, socket, isConnected]); // Depend on the socket connection status

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !socket) return;

    const messageData = {
      rideId: rideID,
      user: {
        id: userID,
        name: UserName,
      },
      message: trimmed,
    };

    socket.emit('chat message', messageData);
    setNewMessage('');
  };


  return (
    <div className="bg-white shadow-xl rounded-xl mx-auto max-w-3xl mt-10 border border-blue-100 h-[80vh] flex flex-col">
      <h2 className="text-2xl font-bold px-6 pt-4 pb-2 text-center text-blue-600 border-b">
        Ride Chat
      </h2>
      <div className="px-4 text-sm text-gray-600 pb-2 border-b relative">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="flex items-center gap-1 text-gray-800 font-medium hover:text-blue-600 transition"
        >
          Members
          <ChevronDown className={`w-4 h-4 transform transition-transform ${showMembers ? 'rotate-180' : ''}`} />
        </button>

        {showMembers && (
          <div className="absolute z-10 mt-2 bg-white border rounded-md shadow-lg p-3 w-56 max-h-60 overflow-y-auto">
            {members.length === 0 ? (
              <div className="text-gray-400 text-sm">No members yet</div>
            ) : (
              members.map((m) => {
                const displayName = m && m.name ? (m.name.includes('@') ? m.name.split('@')[0] : m.name) : 'Unknown';
                return (
                  <div
                    key={m.id}
                    className="text-sm text-blue-800 px-2 py-1 hover:bg-blue-50 rounded-md"
                  >
                    {displayName}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <Loader className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      ) : (
        <>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50"
          >
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg, index) => {
                const senderId = msg.user_id?.toString();
                const currentUserId = userID?.toString();
                const isSelf = senderId === currentUserId;
                
                return (
                  <div key={index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-3 rounded-2xl shadow-md max-w-xs sm:max-w-sm break-words ${
                        isSelf
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none border'
                      }`}
                    >
                      <div className="text-sm mb-1 font-semibold">
                        {isSelf ? 'You' : (msg && msg.name ? (msg.name.includes('@') ? msg.name.split('@')[0] : msg.name) : 'Unknown')}
                      </div>
                      <div>{msg.message}</div>
                      <div className="text-xs mt-1 text-gray-400 text-right">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 py-3 border-t flex items-center gap-2">
            {isRideCompleted ? (
              <div className="p-3 text-center text-gray-500 bg-gray-50 border-t">
                This ride has been completed. Messaging is no longer available.
              </div>
            ) : (
              <div className="flex items-center p-2 bg-gray-100 rounded-b-lg">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-l border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}