import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import postRouter from "./routes/post.routes.js";
import subscriptionRouter from "./routes/subscription.route.js"
import likeRoute from "./routes/like.routes.js";
import profileRoutes from "./routes/profile.routes.js"

app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/likes", likeRoute);
app.use("/api/v1/profile", profileRoutes);

export { app };
