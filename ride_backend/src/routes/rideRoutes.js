import express from "express";
import {
    getAllPendingRides,
    getAllFilteredRides,
    addNewRide,
    getAllUpcomingRides,
    getAllCompletedRides
}
from "../controllers/rideController.js"

const router = express.Router();

router.get("/availableRides" , getAllPendingRides);
router.post("/filteredAvailableRides" , getAllFilteredRides);
router.post("/addRide" , addNewRide);
router.get("/pendingRides" , getAllUpcomingRides);
router.get("/completedRides" , getAllCompletedRides);

export default router;





