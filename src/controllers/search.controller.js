import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const globalSearch = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Search query is required"));
  }

  // Create a case-insensitive regex for flexible searching
  const searchRegex = new RegExp(query, "i");

  // Perform parallel searches
  const [users, posts] = await Promise.all([
    User.aggregate([
      {
        $match: {
          $or: [{ fullName: searchRegex }, { userName: searchRegex }],
        },
      },
      {
        $project: {
          fullName: 1,
          userName: 1,
          avatar: 1,
        },
      },
      {
        $limit: 5, // Limit users to 5
      },
    ]),
    Post.aggregate([
      {
        $match: {
          content: searchRegex,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $project: {
          content: 1,
          image: 1,
          createdAt: 1,
          "owner.fullName": 1,
          "owner.userName": 1,
          "owner.avatar": 1,
        },
      },
      {
        $limit: 5, // Limit posts to 5
      },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        posts,
      },
      "Global search results retrieved successfully",
    ),
  );
});

export { globalSearch };
