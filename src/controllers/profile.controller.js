import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Profile } from "../models/profile.model.js";
import mongoose from "mongoose";

// Register a new profile
const registerProfile = asyncHandler(async (req, res) => {
  const {
    title,
    about,
    githubUrl,
    linkedinUrl,
    links,
    experience,
    education,
    skills,
    location,
  } = req.body;

  const existingProfile = await Profile.findOne({ owner: req.user._id });

  if (existingProfile) {
    throw new ApiError(409, "Profile already exists for this user.");
  }

  const profile = await Profile.create({
    owner: req.user._id,
    title,
    about,
    githubUrl,
    linkedinUrl,
    links,
    experience,
    education,
    skills,
    location,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, profile, "Profile registered successfully."));
});

const changeProfileInfo = asyncHandler(async (req, res) => {
  const {
    title,
    about,
    githubUrl,
    linkedinUrl,
    links,
    location,
    experience,
    education,
    skills,
  } = req.body;

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (location !== undefined) updateFields.location = location;
  if (about !== undefined) updateFields.about = about;
  if (githubUrl !== undefined) updateFields.githubUrl = githubUrl;
  if (linkedinUrl !== undefined) updateFields.linkedinUrl = linkedinUrl;
  if (links !== undefined) updateFields.links = links;
  if (experience !== undefined) updateFields.experience = experience;
  if (education !== undefined) updateFields.education = education;
  if (skills !== undefined) updateFields.skills = skills;

  // Update profile
  const updatedProfile = await Profile.findOneAndUpdate(
    { owner: req.user._id },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Profile not found for the user.");
  }

  // Fetch updated profile with user details
  const profileWithUserInfo = await Profile.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
              _id: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
  ]);

  if (!profileWithUserInfo || profileWithUserInfo.length === 0) {
    throw new ApiError(404, "Profile with user info not found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        profileWithUserInfo[0],
        "Profile information updated successfully with user info."
      )
    );
});

const getProfileByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const profile = await Profile.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName:1,
              avatar: 1,
              _id: 1,
              coverImage: 1,
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
  ]);

  if (!profile) {
    throw new ApiError(404, "Profile not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, profile[0], "Profile fetched successfully."));
});

export { getProfileByUserId, registerProfile, changeProfileInfo };
