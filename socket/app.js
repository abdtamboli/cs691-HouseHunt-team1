// socket app.js

import http from "http";
import { Server } from "socket.io";

// 1) Create your HTTP server
const httpServer = http.createServer();

// 2) Attach a clientError listener
httpServer.on("clientError", (err, socket) => {
  console.error("Client error on socket:", err);
  // Must destroy the socket or headers errors will bubble up
  socket.destroy();
});

// 3) Mount Socket.IO on that server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((u) => u.userId === userId);
  if (!userExists) onlineUser.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((u) => u.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log("Online users:", onlineUser);
  });

  socket.on("sendMessage", ({ chatId, receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", { chatId, ...data });
    } else {
      console.log(`Receiver ${receiverId} not found.`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

// 4) Start listening
httpServer.listen(4000, () => {
  console.log("Socket.IO server running on port 4000");
});
