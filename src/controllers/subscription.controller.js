import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError(404, "not valid user id");
  if (userId === req.user._id)
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "You cannot subscribe to your own profile")
      );

  const existingSubscription = await Subscription.findOne({
    user: userId,
    subscriber: req.user._id,
  });

  if (existingSubscription) {
    await Subscription.deleteOne({ _id: existingSubscription._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    const newSubscription = await Subscription.create({
      user: userId,
      subscriber: req.user._id,
  });
    return res
      .status(200)
      .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
  }
});

const getUserProfileSubscribers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId))
    throw new ApiError(404, "invalid user id");

  const subscribers = await Subscription.find({
    user: userId,
  }).countDocuments();
  const subscribeByUser = await Subscription.findOne({
    user: userId,
    subscriber: req.user._id,
  }).countDocuments();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers, subscribeByUser: subscribeByUser > 0 ? true : false },
        "success"
      )
    );
});
export {
  toggleSubscription,
  getUserProfileSubscribers,
};
