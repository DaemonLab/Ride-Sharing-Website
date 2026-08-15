import {
    handleUserSentRequest,
    handleUserReceivedRequest,
    getSentRequests,
    getReceivedRequests
} from "../models/requestModel.js"

export async function sendRequest(req, res) {
    try {
      const { rideID } = req.body;
      const requestBy = req.session.user.id; // always from session, not body
      const result = await handleUserSentRequest({ rideID, requestBy });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.log("Error in making request :", error.stack);
      res.status(500).json({ success: false, message: "Error making request", error: error.message });
    }
}

export async function handleRequest(req, res) {
    try {
      const { rideID, requestBy, flag } = req.body;
      await handleUserReceivedRequest({ rideID, requestBy, flag });
      res.status(200).json({
        success: true,
        data: "Request handled successfully."
      });
    } catch (error) {
      console.log("Error in handling request :", error.stack);
      res.status(500).json({ success: false, message: "Error handling request", error: error.message });
    }
}

export async function getRequestsSent(req, res) {
    try {
      const requestBy = req.session.user.id; // from session
      const result = await getSentRequests({ requestBy });
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
      const createdBy = req.session.user.id; // from session
      const result = await getReceivedRequests({ createdBy });
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
