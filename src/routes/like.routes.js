import { Router } from 'express';
import {
  getPostLikes,
  togglePostLike
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/p/:postId").post(togglePostLike);
router.route("/video/:postId").get(getPostLikes);

export default router
