import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth'; 
import { toast } from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Custom hook to easily use the socket context
export const useSocket = () => {
  return useContext(SocketContext);
};

// The provider component that will wrap our app
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
        withCredentials: true,
        query: {
          userId: user.id
        }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected globally:', newSocket.id);
      });

     
      newSocket.on('chat message', (msg) => {
        if (msg.user_id !== user.id) {
          toast.success(`New message from ${msg.name}`, {
            icon: '💬',
            position: "top-right",
            
          });
        }
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected.');
      });

      return () => {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('chat message');
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]); 

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};