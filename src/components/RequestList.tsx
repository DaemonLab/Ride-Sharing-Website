import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RideRequest } from "../services/api";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface RequestListProps {
  requests: RideRequest[];
  type: "sent" | "received";
  onAction?: (
    rideId: string,
    requestBy: number,
    action: "Accepted" | "Rejected"
  ) => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  type,
  onAction,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (
    rideId: string,
    requestBy: number,
    action: "Accepted" | "Rejected"
  ) => {
    if (!onAction) return;
    setActionLoading(`${rideId}-${action}`);
    try {
      await onAction(rideId, requestBy, action);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-200",
          dot: "bg-amber-400",
        };
      case "Accepted":
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          dot: "bg-emerald-400",
        };
      case "Rejected":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          dot: "bg-red-400",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };
  // const formatTimeAgo = ({ request }) => {
  //   const date = new Date(request.createdAt);
  //   const now = new Date();
  //   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  //   if (diffInSeconds < 60) return "Just Now";
  //   if (diffInSeconds < 3600)
  //     return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  //   if (diffInSeconds < 86400)
  //     return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  //   return date.toLocaleDateString();
  // };

  if (requests.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {type === "sent" ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            )}
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No {type} requests
        </h3>
        <p className="text-gray-500 text-center max-w-sm">
          {type === "sent"
            ? "You haven't sent any ride requests yet."
            : "You haven't received any ride requests yet."}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {requests.slice().reverse().map((request) => {
        const isAccepted = request.requestStatus === "Accepted";
        const statusConfig = getStatusConfig(request.requestStatus);

        const cardContent = (
          <motion.div
            variants={itemVariants}
            className={`bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 ${
              isAccepted
                ? "hover:border-gray-300 hover:shadow-sm cursor-pointer"
                : "hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {type === "sent" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-6 4h6m2-12v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {type === "sent"
                        ? `Ride request to ${request.destination}`
                        : `${
                            request.requestByName || `User ${request.requestBy}`
                          }`}
                    </h3>
                  </div>
                </div>

                {request.source && request.destination && (
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="truncate">{request.source}</span>
                    </div>
                    <div className="w-4 h-px bg-gray-300 flex-shrink-0"></div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="truncate">{request.destination}</span>
                    </div>
                  </div>
                )}

                {/* <p>
                  Requested {formatTimeAgo(request.createdAt)}
                  {request.statusChangedAt &&
                    request.requestStatus !== "Pending" &&
                    ` ${request.requestStatus.toLocaleLowerCase()} ${formatTimeAgo(
                      request.statusChangedAt
                    )}`}
                </p> */}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                  {request.date && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-6 4h6m2-12v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2z"
                        />
                      </svg>
                      <span>
                        {format(new Date(request.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                  {request.time && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{request.time}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                    ></div>
                    {request.requestStatus}
                  </div>

                  {isAccepted && (
                    <div className="text-xs text-gray-500 font-medium">
                      Click to view details
                    </div>
                  )}
                </div>
              </div>

              {type === "received" &&
                request.requestStatus === "Pending" &&
                onAction && (
                  <div className="flex items-center gap-2 ml-6 flex-shrink-0">
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAction(
                          request.rideID,
                          request.requestBy,
                          "Accepted"
                        );
                      }}
                      disabled={actionLoading === `${request.rideID}-Accepted`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {actionLoading === `${request.rideID}-Accepted` ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-3 h-3 border border-emerald-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      Accept
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAction(
                          request.rideID,
                          request.requestBy,
                          "Rejected"
                        );
                      }}
                      disabled={actionLoading === `${request.rideID}-Rejected`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {actionLoading === `${request.rideID}-Rejected` ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-3 h-3 border border-red-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      Decline
                    </motion.button>
                  </div>
                )}
            </div>
          </motion.div>
        );

        return isAccepted ? (
          <Link
            to={`/ride/${request.rideID}`}
            key={`link-${request.rideID}`}
            className="block"
          >
            {cardContent}
          </Link>
        ) : (
          <div key={request.rideID}>{cardContent}</div>
        );
      })}
    </motion.div>
  );
};
