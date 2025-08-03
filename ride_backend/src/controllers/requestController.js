import {
    handleUserSentRequest,
    handleUserReceivedRequest,
    getSentRequests,
    getReceivedRequests
} from "../models/requestModel.js"

export async function sendRequest(req, res) {
    try {
      const result = await handleUserSentRequest(req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.log("Error in making request :", error.stack);
      res.json("Error");
    }
}

export async function handleRequest(req, res) {
    try {
      await handleUserReceivedRequest(req.body);   
      res.status(200).json({
        success: true,
        data: "Request handled successfully."
      });
    } catch (error) {
      console.log("Error in handling request :", error.stack);
      res.json("Error");
    }
} 

export async function getRequestsSent(req, res) {
    try {
      const result = await getSentRequests(req.body);
      res.status(200).json({
        success: true,
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
  
