import RideChat from '../components/RideChat';

function Chat() {
  const dummyRideID = 'ride123'; // Replace with actual rideID when integrating
  const dummyUserID = "12";
  const dummyUserName = "jhon doe";

  return (
    <div className="min-h-screen py-28 px-4 relative">
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-primary/10 blur-[110px] top-10 -left-16 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-0 -right-16 pointer-events-none" />
      <div className="relative z-10">
        <RideChat
          rideID={dummyRideID}
          userID={dummyUserID}
          UserName={dummyUserName}
        />
      </div>
    </div>
  );
}

export default Chat;
