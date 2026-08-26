import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Loader, Send, ChevronDown, Users } from 'lucide-react';

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
  id?: number;
  user_id?: string;
  name: string;
}

export default function RideChat({ rideID, userID, UserName }: RideChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);

  // Socket is held in a ref so it persists across renders without triggering re-renders.
  // It is created lazily the first time this component mounts — NOT at module load time —
  // so there is no WebSocket connection opened on pages that don't use chat.
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!rideID) return;

    // Create the socket connection only when the chat page is actually open
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
      withCredentials: true,
    });
    const socket = socketRef.current;

    socket.emit('joinRoom', { rideId: rideID });

    socket.on('ride members', (memberList: Member[]) => {
      setMembers(memberList);
    });

    socket.emit('getOlderMessages', { rideId: rideID });

    socket.on('older messages', (fetchedMessages: Message[]) => {
      setMessages(fetchedMessages);
      setLoading(false);
    });

    socket.on('chat message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('chat error', (message: string) => {
      setLoading(false);
      console.error(message);
    });

    return () => {
      // Fully disconnect when navigating away from chat — prevents ghost connections
      socket.disconnect();
      socketRef.current = null;
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
    if (!trimmed || !socketRef.current) return;

    const messageData = {
      rideId: rideID,
      user: { id: userID, name: UserName },
      message: trimmed,
    };

    socketRef.current.emit('chat message', messageData);
    setNewMessage('');
  };

  return (
    <div className="glass-strong rounded-md mx-auto max-w-3xl h-[78vh] flex flex-col overflow-hidden">
      <h2 className="font-display text-xl font-bold px-6 pt-5 pb-3 text-center text-ink border-b border-white/60">
        Ride Chat
      </h2>

      {/* Members Dropdown */}
      <div className="px-4 text-sm pb-2 border-b border-white/60 relative">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="flex items-center gap-1.5 text-ink-variant font-medium hover:text-primary transition py-1.5"
        >
          <Users className="w-4 h-4" />
          Members
          <ChevronDown className={`w-4 h-4 transform transition-transform ${showMembers ? 'rotate-180' : ''}`} />
        </button>

        {showMembers && (
          <div className="absolute z-10 mt-1 glass-strong rounded-lg shadow-glass-lg p-3 w-56 max-h-60 overflow-y-auto">
            {members.length === 0 ? (
              <div className="text-ink-variant/60 text-sm">No members yet</div>
            ) : (
              members.map((m) => (
                <div
                  key={m.user_id ?? m.id}
                  className="text-sm text-primary-dark px-2 py-1.5 hover:bg-primary/10 rounded-md"
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
          <Loader className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : (
        <>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          >
            {messages.length === 0 ? (
              <p className="text-ink-variant text-center">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg, index) => {
                const isSelf = msg.user_id === userID;
                return (
                  <div key={index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-3 rounded-2xl max-w-xs sm:max-w-sm break-words ${
                        isSelf
                          ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-md shadow-glow'
                          : 'glass text-ink rounded-bl-md'
                      }`}
                    >
                      <div className="text-xs mb-1 font-semibold opacity-90">
                        {isSelf ? 'You' : msg.name.split('@')[0]}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      <div className={`text-[10px] mt-1 text-right ${isSelf ? 'text-white/70' : 'text-ink-variant/70'}`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="px-4 py-3 border-t border-white/60 flex items-center gap-2">
            <div className="glass-input flex-1 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-transparent focus:outline-none placeholder:text-ink-variant/60 text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button
              onClick={handleSend}
              className="bg-gradient-to-br from-primary to-primary-dark text-white p-3 rounded-full shadow-glow hover:-translate-y-0.5 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
