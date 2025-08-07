import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { Loader, Send ,ChevronDown} from 'lucide-react';


const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
  withCredentials: true
});

interface RideChatProps {
  rideID: string;
  userID: string;
  UserName: string;
}

interface Message {
  rideId: string;
  user_id: string;
  name: string;
  message: string;
  timestamp: string;
}

interface Member {
  user_id: string;
  name: string;
}

export default function RideChat({ rideID, userID, UserName }: RideChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false); // Add this state at the top
    const { user } = useAuth();

  useEffect(() => {
    if (!rideID) return;

    socket.emit('joinRoom', rideID);

    socket.on('ride members', (memberList: Member[]) => {
      setMembers(memberList);
    });

    socket.emit("getOlderMessages", rideID);

    socket.on("older messages", (fetchedMessages: Message[]) => {
      setMessages(fetchedMessages);
      setLoading(false);
    });

    socket.on('chat message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    // dummy data 
    // ✅ Inject dummy data in development
  if (import.meta.env.DEV) {
    setTimeout(() => {
      setMembers([
        { user_id: '12', name: 'jhon doe' },
        { user_id: '34', name: 'alice@example.com' },
        { user_id: '56', name: 'bob@example.com' }
      ]);
    }, 500);

    setTimeout(() => {
      setMessages([
        {
          rideId: rideID,
          user_id: '12',
          name: 'jhon doe',
          message: 'Hey, what time are we leaving?',
          timestamp: new Date().toISOString()
        },
        {
          rideId: rideID,
          user_id: '34',
          name: 'alice@example.com',
          message: "Around 4:30 PM works for me!",
          timestamp: new Date().toISOString()
        },
        {
          rideId: rideID,
          user_id: '56',
          name: 'bob@example.com',
          message: "Perfect, I'll bring snacks 😄",
          timestamp: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 800);
  }
 

    return () => {
      socket.off('chat message');
      socket.off('ride members');
      socket.off("older messages");
    };
  }, [rideID]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

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

      {/* Members List */}
      {/* <div className="px-4 text-sm text-gray-600 pb-2 border-b flex flex-wrap gap-2">
        <span className="font-medium text-gray-800">Members:</span>
        {members.map((m) => (
          <span key={m.user_id} className="bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-800">
            {m.name.split('@')[0]}
          </span>
        ))}
      </div> */}
      {/* Members Dropdown */}
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
        members.map((m) => (
          <div
            key={m.user_id}
            className="text-sm text-blue-800 px-2 py-1 hover:bg-blue-50 rounded-md"
          >
            {m.name.split('@')[0]}
          </div>
        ))
      )}
    </div>
  )}
</div>


      {/* Messages Area */}
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
                const isSelf = msg.user_id === userID;
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
                        {isSelf ? 'You' : msg.name.split('@')[0]}
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

          {/* Message Input */}
          <div className="px-4 py-3 border-t flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}