import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
  } from "react";
  import apiClient, { RideRequest } from "../services/api";
  import { useAuth } from "./AuthContext";
  
  interface RequestContextType {
    sentRequests: RideRequest[];
    receivedRequests: RideRequest[];
    loading: boolean;
    error: string | null;
    fetchRequests: () => void;
  }
  
  const RequestContext = createContext<RequestContextType | undefined>(undefined);
  
  export const RequestProvider: React.FC<{ children: ReactNode }> = ({
    children,
  }) => {
    const { user } = useAuth();
  
    const [sentRequests, setSentRequests] = useState<RideRequest[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<RideRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchRequests = useCallback(async () => {
      if (!user?.id) {
        setReceivedRequests([]); 
        setSentRequests([]);
        return;
      }
  
      setLoading(true);
      setError(null);
      try {
        const [sent, received] = await Promise.all([
          apiClient.getSentRequests(user.id),
          apiClient.getReceivedRequests(user.id),
        ]);
        setSentRequests(sent);
        setReceivedRequests(received);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please try again.");
      } finally {
        setLoading(false);
      }
    }, [user?.id]);
  
    useEffect(() => {
      fetchRequests();
    }, [fetchRequests]);
  
    const value = {
      sentRequests,
      receivedRequests,
      loading,
      error,
      fetchRequests,
    };
  
    return (
      <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
    );
  };
  
  export const useRequests = () => {
    const context = useContext(RequestContext);
    if (context === undefined) {
      throw new Error("useRequests must be used within a RequestProvider");
    }
    return context;
  };