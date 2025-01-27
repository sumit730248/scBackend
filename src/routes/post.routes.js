import { Router } from "express";
import {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { verifyJWT, verifyJWTLite } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(verifyJWTLite, getAllPosts)
  .post(
    verifyJWT,
    upload.fields([
      {
        name: "image",
        maxCount: 1,
      },
    ]),
    createPost,
  );
router.use(verifyJWT);
router.route("/:postId").patch(updatePost).delete(deletePost);

export default router;
