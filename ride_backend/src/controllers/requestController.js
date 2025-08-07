import {
    handleUserSentRequest,
    handleUserReceivedRequest,
    getSentRequests,
    getReceivedRequests
} from "../models/requestModel.js"
export async function sendRequest(req, res) {
    try {
      const { success, message } = await handleUserSentRequest(req.body);
      
      res.status(success ? 200 : 400).json({
        success: success,
        message: message
      });
    } catch (error) {
      console.log("Error in making request :", error.stack);
      // FIX: Improved error response
      res.status(500).json({
        success: false,
        message: "Failed to make ride request",
        error: error.message
      });
    }
}

export async function handleRequest(req, res) {
    try {
      const result = await handleUserReceivedRequest(req.body);
      res.status(200).json({
        success: true,
        message: result.message || "Request handled successfully."
      });
    } catch (error) {
      console.error("Error in handling request:", error.stack);
      // Provide more specific status codes based on error type
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to handle ride request"
      });
    }
}  

export async function getRequestsSent(req, res) {
    try {
      const result = await getSentRequests(req.body);
      res.status(200).json({
        success: true,
        message: "Requests sent fetched successfully.",
        data: result
      });
    } catch (error) {
      console.error(`Error in fetching requests sent: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to fetch requests sent",
        error: error.message
      });
    }
}

export async function getRequestsReceived(req, res) {
    try {
      const result = await getReceivedRequests(req.body);
      res.status(200).json({
        success: true,
        message: "Requests received fetched successfully.",
        data: result
      });
    } catch (error) {
      console.error(`Error in fetching requests received: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to fetch requests received",
        error: error.message
      });
    }
}
  