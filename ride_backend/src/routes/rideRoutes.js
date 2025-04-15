import express from "express";
import {
    getAllPendingRides,
    getAllFilteredRides,
    addNewRide
}
from "../controllers/rideController.js"

const router = express.Router();

router.post("/availableRides" , getAllPendingRides);
router.post("/filteredAvailableRides" , getAllFilteredRides);
router.post("/addRide" , addNewRide);

export default router;






