import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequests } from "../context/RequestContext"; // <--- Import the hook
import apiClient from "../services/api";
import { RequestList } from "../components/RequestList";
import { toast } from "react-hot-toast";

export const Requests: React.FC = () => {
  // Get everything from our new context!
  const {
    sentRequests,
    receivedRequests,
    loading,
    error,
    fetchRequests,
  } = useRequests();
  
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  const handleAction = useCallback(async (
    rideId: string,
    requestBy: number,
    action: "Accepted" | "Rejected"
  ) => {
    try {
      await apiClient.handleRideRequest(rideId, requestBy, action);
      toast.success(`Request ${action.toLowerCase()}ed successfully`);
      await fetchRequests(); // Call the fetch function from the context
    } catch (error: any) {
      console.error("Error handling request:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to process request"
      );
    }
  }, [fetchRequests]);


  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const tabVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 mt-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Ride Requests
          </h1>
          
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          variants={itemVariants}
          whileHover={{
            y: -2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-blue-600 px-8 py-6">
            <nav className="flex space-x-1 rounded-lg p-1 backdrop-blur-sm">
              {[
                {
                  key: "sent",
                  label: "Sent",
                  count: sentRequests.length,

                },
                {
                  key: "received",
                  label: "Received",
                  count: receivedRequests.length,

                },
              ].map(({ key, label, count }) => (
                <motion.button
                  key={key}
                  onClick={() => setActiveTab(key as "sent" | "received")}
                  className={`relative flex-1 py-3 px-6 rounded-md font-semibold text-sm transition-all duration-300 ${
                    activeTab === key
                      ? "bg-white text-blue-600 shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence>
                    {activeTab === key && (
                      <motion.div
                        className="absolute inset-0 bg-white rounded-md shadow-lg"
                        layoutId="activeTab"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative flex items-center justify-center gap-2">
                   
                    {label} ({count})
                  </span>
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="inline-block h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <p className="text-gray-600 text-lg">
                    Loading your requests...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <svg
                          className="h-6 w-6 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-red-800 font-semibold">
                        Something went wrong
                      </h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                    <motion.button
                      onClick={fetchRequests}
                      className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Retry
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!loading && !error && (
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="min-h-[400px]"
                >
                  {activeTab === "sent" ? (
                    <RequestList requests={sentRequests} type="sent" />
                  ) : (
                    <RequestList
                      requests={receivedRequests}
                      type="received"
                      onAction={handleAction}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!loading && !error && (
              <motion.div
                className="text-center mt-8 pt-8 border-t border-gray-100"
                variants={itemVariants}
              >
                <p className="text-gray-500 text-sm">
                  {activeTab === "sent"
                    ? `You have sent ${sentRequests.length} ride request${
                        sentRequests.length !== 1 ? "s" : ""
                      }`
                    : `You have received ${
                        receivedRequests.length
                      } ride request${
                        receivedRequests.length !== 1 ? "s" : ""
                      }`}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div className="text-center mt-8" variants={itemVariants}>
          <motion.button
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{
                duration: 1,
                repeat: loading ? Infinity : 0,
                ease: "linear",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </motion.svg>
            Refresh Requests
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Requests;
