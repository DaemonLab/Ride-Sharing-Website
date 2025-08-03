import {
  getPendingRides,
  getFilteredPendingRides,
  addNewlyCreatedRide,
  getUpcomingRides,
  getCompletedRides
} from "../models/rideModel.js";



export async function getAllPendingRides(req, res) {
  try {
    const result = await getPendingRides(req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`Error in fetching pending rides: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending rides",
      error: error.message
    });
  }
}


export async function getAllFilteredRides(req, res) {
  try {
    const result = await getFilteredPendingRides(req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`Error in fetching filtered rides: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filtered rides",
      error: error.message
    });
  }
}


export async function addNewRide(req, res) {
  try {
    await addNewlyCreatedRide(req.body);
    res.status(201).json({
      success: true,
      message: "Ride created successfully"
    });
  } catch (error) {
    console.error("Error in creating ride:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create ride",
      error: error.message
    });
  }
}


export async function getAllUpcomingRides(req, res) {
  try {
    const result = await getUpcomingRides(req.body);
    res.status(200).json({
      success: true,
      message: "Upcoming rides fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in fetching upcoming rides:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming rides",
      error: error.message
    });
  }
}


export async function getAllCompletedRides(req, res) {
  try {
    const result = await getCompletedRides(req.body);
    res.status(200).json({
      success: true,
      message: "Completed rides fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in fetching completed rides:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch completed rides",
      error: error.message
    });
  }
}
