import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  let imageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.image) &&
    req.files.image.length > 0
  ) {
    imageLocalPath = req.files.image[0].path;
  }

  const image = await uploadOnCloudinary(imageLocalPath);

  if (content === "") throw new ApiError(400, "content is required");

  const post = await Post.create({
    content: content,
    image: image?.url || "",
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post created successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  if (!mongoose.Types.ObjectId.isValid(tweetId))
    throw new ApiError(404, "invalid params id");

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $set: {
        content: content,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post update successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId))
    throw new ApiError(404, "invalid params id");

  const deletedPost = await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedPost, "Post deleted successfully"));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, userId } = req.query;
  const userIdFromReq = req.user?._id; // Get the current user's ID if logged in
  const skip = (page - 1) * limit;
  const matchStage = {};
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(new ApiResponse(404, "Invalid user id"));
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id", // The post ID
        foreignField: "post", // Field in the "likes" collection that references the post
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" }, // Count the total likes
        isLiked: userIdFromReq
          ? {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: "$likes", // Filter the likes array
                          as: "like",
                          cond: { $eq: ["$$like.likedBy", new mongoose.Types.ObjectId(req.user._id)] },
                        },
                      },
                    },
                    0,
                  ],
                },
                then: true,
                else: false,
              },
            }
          : false, // Default to false if user is not logged in
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        image: 1,
        content: 1,
        likes: 1,
        isLiked: 1,
        "owner._id": 1,
        "owner.fullName": 1,
        "owner.userName": 1,
        "owner.avatar": 1,
        createdAt: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    { $skip: skip },
    { $limit: parseInt(limit, 10) },
  ];

  const countPipeline = [{ $match: matchStage }, { $count: "totalPosts" }];

  const [posts, totalPostsResult] = await Promise.all([
    Post.aggregate(pipeline),
    Post.aggregate(countPipeline),
  ]);

  const totalPosts =
    totalPostsResult.length > 0 ? totalPostsResult[0].totalPosts : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPosts,
        page,
        limit,
        posts,
      },
      "Got all Posts successfully",
    ),
  );
});

export { getAllPosts, createPost, updatePost, deletePost };
