const express = require('express');
const session = require('express-session');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.locals.io = io;

app.use(cookieParser());

app.use(session({
  secret: 'our little secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const DB = require('./db/dbConn.js');
// DB.createTables().then(console.log).catch(console.error);
DB.createRTables().then(console.log).catch(console.error);

app.use(cors({
  methods: ["GET", "POST"],
  credentials: true,
  origin: ['http://localhost:3000']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectedUsers = {}; // userId -> socket.id

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Frontend must emit 'register' with userId after connecting
  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on("send-notification", (notif) => {
    const targetSocketId = connectedUsers[notif.worker_id];
    if (targetSocketId) {
      io.to(targetSocketId).emit("new-notification", notif);
    } else {
      console.log(`Worker ${notif.worker_id} is offline, cannot send real-time notification.`);
    }
  });

  socket.on("mark-done", (notifId) => {
    io.emit("notification-done", notifId); // still broadcast to all for now
  });

  socket.on("disconnect", () => {
    // Remove disconnected user from map
    for (const [userId, sid] of Object.entries(connectedUsers)) {
      if (sid === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});


const machines = require('./routes/machines');
const users = require('./routes/users');
const upload = require('./routes/upload');
app.use('/machines', machines);
app.use('/users', users);
app.use('/uploadFile', upload);

const path = require('path');
app.use(express.static(path.join(__dirname, "build")));
app.use(express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));
