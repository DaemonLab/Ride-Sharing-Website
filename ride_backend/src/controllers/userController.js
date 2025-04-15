import { Details } from "../models/userModel.js";



export async function getDetails(req, res) {
    try {
      const result = await Details();

      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(result);
    } catch (error) {
        console.error(`Error in serverCheck: ${error.message}`);
        return res.status(500).json({ message: "Internal Server Error" });   
    }
  }
  