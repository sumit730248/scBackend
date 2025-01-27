import { Router } from "express";
import { toggleSubscription, getUserProfileSubscribers } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/s/:userId").get(getUserProfileSubscribers).post(toggleSubscription);

export default router;
