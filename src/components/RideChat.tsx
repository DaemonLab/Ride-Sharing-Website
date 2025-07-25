import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Loader, Send } from 'lucide-react';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

interface RideChatProps {
  rideID: string;
}

interface Message {
  rideid: string;
  rideowner: string;
  messageby: string;
  message: string;
  messagetime: string;
  messagedate: string;
}

export default function RideChat({ rideID }: RideChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [messageBy, setMessageBy] = useState('john.doe@iiti.ac.in');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rideID) return;

    socket.emit('joinRide', rideID);
    socket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, [rideID]);

  useEffect(() => {
    async function fetchMessages() {
      const dummyData: Message[] = [
        {
          rideid: rideID,
          rideowner: 'ravi.kumar@iiti.ac.in',
          messageby: 'ravi.kumar@iiti.ac.in',
          message: 'Hi, ride available from campus at 4 PM.',
          messagetime: '14:30',
          messagedate: '2025-07-25',
        },
        {
          rideid: rideID,
          rideowner: 'ravi.kumar@iiti.ac.in',
          messageby: 'john.doe@iiti.ac.in',
          message: 'Can you wait for 10 minutes?',
          messagetime: '14:32',
          messagedate: '2025-07-25',
        },
      ];
      setMessages(dummyData);
      setLoading(false);
    }

    fetchMessages();
  }, [rideID]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toISOString().slice(0, 10);

    const newMsg: Message = {
      rideid: rideID,
      rideowner: 'ravi.kumar@iiti.ac.in',
      messageby: messageBy,
      message: newMessage,
      messagetime: time,
      messagedate: date,
    };

    socket.emit('sendMessage', newMsg);
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="bg-white shadow-xl rounded-xl mx-auto max-w-3xl mt-10 border border-blue-100 h-[80vh] flex flex-col">
      <h2 className="text-2xl font-bold px-6 pt-4 pb-2 text-center text-blue-600 border-b">Ride Chat</h2>

      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <Loader className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      ) : (
        <>
          {/* ✅ Chat Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50"
          >
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg, index) => {
                const isSelf = msg.messageby === messageBy;
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
                        {isSelf ? 'You' : msg.messageby.split('@')[0]}
                      </div>
                      <div>{msg.message}</div>
                      <div className="text-xs mt-1 text-gray-400 text-right">
                        {msg.messagedate} • {msg.messagetime}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ✅ Input Area - fixed at bottom */}
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
