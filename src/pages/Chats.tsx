// // In Chats.tsx

// import React from 'react';
// import RideChat from '../components/RideChat';
// import { useParams } from 'react-router-dom'; // Import useParams
// import { useAuth } from '../context/AuthContext'; // Import your auth hook


// function Chat() {
//   // 1. Get the rideId from the URL
//   const { rideId } = useParams<{ rideId: string }>();

//   // 2. Get the current user's data from your authentication context
//   const { user } = useAuth(); // Assuming your auth context provides { id, name, ... }

//   // 3. Add loading/error states for robustness
//   if (!user) {
//     return <div className="text-center p-10">Please log in to view the chat.</div>;
//   }

//   if (!rideId) {
//     return <div className="text-center p-10">Error: No Ride ID provided.</div>;
//   }

//   return (
//     <div className='min-h-screen bg-gray-50 py-12 mt-8'>
//       {/* 4. Pass the REAL data as props to the RideChat component */}
//       <RideChat
//         rideID={rideId}
//         userID={user.id}
//         UserName={user.name}
//       />
//     </div>
//   );
// }

// export default Chat;