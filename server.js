const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let clients = [];
io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    clients = clients.filter((user) => user.socketID !== socket.id);
    socket.broadcast.emit("updateUserList", clients);
  });

  socket.on("setName", (name) => {
    // Thêm user mới vào danh sách
    clients.push({ name, socketID: socket.id });

    // Gửi danh sách người dùng đến tất cả client
    io.emit("updateUserList", clients);
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(5000, () => console.log("server is running on port 5000"));
