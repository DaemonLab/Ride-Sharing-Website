import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient, { RideRequest } from '../services/api';
import { RequestList } from '../components/RequestList';
import { toast } from 'react-hot-toast';

export const Requests: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [sentRequests, setSentRequests] = useState<RideRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [sent, received] = await Promise.all([
        apiClient.getSentRequests(user.id),
        apiClient.getReceivedRequests(user.id)
      ]);
      
      setSentRequests(sent);
      setReceivedRequests(received);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const handleAction = async (rideId: string, requestBy: number, action: 'Accepted' | 'Rejected') => {
    try {
      // Find the request to get the requester's ID
      const request = receivedRequests.find(req => req.rideID === rideId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      await apiClient.handleRideRequest(rideId, requestBy, action);
      toast.success(`Request ${action.toLowerCase()}ed successfully`);
      
      // Refresh the requests after action
      fetchRequests();
    } catch (error: any) {
      console.error('Error handling request:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to process request');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl mt-12">
      <h1 className="text-3xl font-bold mb-8">My Ride Requests</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('received')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'received'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading requests...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : activeTab === 'received' ? (
        <RequestList 
          requests={receivedRequests} 
          type="received" 
          onAction={handleAction }
        />
      ) : (
        <RequestList 
          requests={sentRequests} 
          type="sent" 
        />
      )}
    </div>
  );
};

export default Requests;
