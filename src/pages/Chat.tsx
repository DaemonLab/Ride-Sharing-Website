import React from 'react';
import RideChat from '../components/RideChat';

function Chat() {
  const dummyRideID = 'ride123'; // 🔁 Replace with actual rideID when integrating

  return (
    <div className='min-h-screen bg-gray-50 py-12 mt-8'>
      <RideChat rideID={dummyRideID} />
    </div>
  );
}

export default Chat;
