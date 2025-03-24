import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

const app = express();

// CORS configuration
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Route bindings
app.use("/api/auth", authRoute);       // Auth routes (login/register/logout)
app.use("/api/users", userRoute);      // User routes
app.use("/api/posts", postRoute);      // Post routes
app.use("/api/test", testRoute);       // Separate test route (optional)
app.use("/api/chats", chatRoute);      // Chat routes
app.use("/api/messages", messageRoute); // Message routes

// ✅ Health check or quick ping route
app.get("/api/auth/test", (req, res) => {
  res.status(200).json({ message: "Auth route is reachable!" });
});

// Start server
app.listen(8800, '0.0.0.0', () => {
  console.log('API server running on port 8800');
});