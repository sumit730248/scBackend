import mongoose from "mongoose";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getPostLikes = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(404, "not valid video id");

  const likeCount = await Like.find({
    post: postId,
  }).countDocuments();
  const likedByUser = await Like.findOne({
    post: postId,
    likedBy: req.user._id,
  }).countDocuments();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likeCount, likedByUser: likedByUser > 0 ? true : false },
        "success"
      )
    );
});

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(404, "not valid video id");

  const alreadyLiked = await Like.findOne({
    post: postId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unLike successfully"));
  } else {
    const newLike = await Like.create({
      post: postId,
      likedBy: req.user._id,
    });
    res.status(200).json(new ApiResponse(200, newLike, "liked successfully"));
  }
});

export {
  togglePostLike,
  getPostLikes,
};
