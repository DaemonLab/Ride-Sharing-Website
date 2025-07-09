import dotenv from "dotenv";
import { logger } from "./src/config/logger.js";
dotenv.config();

import app from "./src/app.js";

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => logger.log("info", `Server running on port ${PORT}`));