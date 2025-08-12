import express from "express";
import {
    getAllPendingRides,
    getAllFilteredRides,
    addNewRide,
    getAllUpcomingRides,
    getRideById,
    getAllCompletedRides

}
    from "../controllers/rideController.js"

const router = express.Router();

router.get("/availableRides", getAllPendingRides);
router.get("/:id", getRideById);
router.post("/filteredAvailableRides", getAllFilteredRides);
router.post("/addRide", addNewRide);
router.post("/user/upcoming", getAllUpcomingRides);
router.post("/user/completed", getAllCompletedRides);

export default router;



