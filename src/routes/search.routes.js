import express from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const searchRouter = express.Router();

// Global search route (optional authentication)
searchRouter.get("/", verifyJWT, globalSearch);

export default searchRouter;
