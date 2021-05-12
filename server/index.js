// import express from "express";
// import http from "http";

// const app = express();
// const server = http.createServer(app);

// app.get("/", (req, res) => {
//   res.send("<h1>Hello world</h1>");
// });

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const clientURL = "http://localhost:3000";
const io = new Server(server, {
  cors: {
    origin: clientURL,
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.join("public");
  socket.on("chat message", (data) => {
    io.in(data.room).emit("chat message", data.msg);
  });
  socket.on("join private", () => {
    socket.leave("public");
    socket.join("private");
    socket.emit("joined");
    socket.to("private").emit("user joined", socket.id);
    // io.to('private').emit(`${socket.id} has joined the room`);
  });
  socket.on("leave private", () => {
    socket.leave("private");
    socket.join("public");
    socket.emit("exit private room");
  });
  socket.on("typing", (room) => {
    socket.to(room).emit("type", socket.id);
  });
  socket.on("done typing", (room) => {
    socket.to(room).emit("end type", socket.id);
  });
});
// io.on("changeRoom", (socket) => {
//   socket.join("bake");
// });
server.listen(3030, () => {
  console.log("listening on port 3030");
});
