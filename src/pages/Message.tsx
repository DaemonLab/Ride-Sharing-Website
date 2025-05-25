import React from "react";

interface MessageProps {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isCurrentUser: boolean;
}

const Message = ({
  text,
  sender,
  timestamp,
  isCurrentUser,
}: MessageProps) => {
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} px-4 py-2`}>
      <div className="flex flex-col items-end max-w-[75%] space-y-1">
        <div className={`rounded-b-lg rounded-r-lg px-4 py-2 text-sm shadow-lg transition-all duration-200 
          ${isCurrentUser 
            ? "bg-gradient-to-bl from-blue-500 to-blue-600 text-white" 
            : "bg-white border border-gray-200 text-gray-900"}`}>
          {!isCurrentUser && (
            <div className="text-xs font-semibold text-blue-600 mb-1">
              {sender.name}
            </div>
          )}
          <p>{text}</p>
        </div>
        <span className={`text-[0.65rem] ${isCurrentUser ? "text-blue-200" : "text-gray-500"} tracking-wide`}>
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default Message;