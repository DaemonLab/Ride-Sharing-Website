import React from 'react'
import apiClient from '../services/api'

const Dummy = () => {
  const handleClick = async () => {
    try {
      const data = await apiClient.getAllRides();
      console.log('Ride details:', data);
    } catch (error) {
      console.error('Failed to fetch ride details:', error);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen gap-4'>
      <button 
        onClick={handleClick} 
        className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors'
      >
        Fetch Ride Details
      </button>
    </div>
  )
}

export default Dummy
