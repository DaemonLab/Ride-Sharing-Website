import React, { useEffect, useState } from 'react';
import { RideRequest } from '../services/api';
import { format } from 'date-fns';

interface RequestListProps {
  requests: RideRequest[];
  type: 'sent' | 'received';
  onAction?: (rideId: string, requestBy: number, action: 'Accepted' | 'Rejected') => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, type, onAction }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No {type} requests found.
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-screen">
      {requests.map((request) => (
        <div
          key={request.rideID}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
              {type === 'sent' ? `You requested a ride to ${request.destination}` : `Request from ${request.requestBy}`}
              </h3>
              {request.source && request.destination && (
                <p className="text-gray-600">
                  {request.source} → {request.destination}
                </p>
              )}
              {request.date && (
                <p className="text-sm text-gray-500">
                  {format(new Date(request.date), 'PPP')}
                  {request.time && ` • ${request.time}`}
                </p>
              )}
              <p className="text-sm mt-2">
                Status: <span className="font-medium">{request.requestStatus}</span>
              </p>
            </div>
            
            {type === 'received' && request.requestStatus === 'Pending' && onAction && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onAction(request.rideID, request.requestBy, 'Accepted')}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => onAction(request.rideID, request.requestBy, 'Rejected')}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
