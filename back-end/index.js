const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const FRONTENDS = ['http://localhost:3000'];

app.use(cors({
  origin: FRONTENDS,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors({ origin: FRONTENDS, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'our little secret',
  resave: false,
  saveUninitialized: false,       
  cookie: {
    httpOnly: true,
    sameSite: 'Lax',              
    secure: false,                
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

const io = new Server(server, {
  cors: {
    origin: FRONTENDS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.locals.io = io;

const connectedUsers = new Map(); 
let workerLocations = new Map();  

io.on("connection", (socket) => {
  socket.on("register", (payload) => {
    if (!payload?.uid) return;
    connectedUsers.set(payload.uid, socket.id);
    socket.data.uid = payload.uid;
    socket.data.type = payload.type || "worker";
    socket.join(`user:${payload.uid}`);
  });

  socket.on("request-worker-location", ({ requestedBy } = {}) => {
    io.emit("location-ping"); 
  });

  socket.on("worker-location", (loc) => {
    if (!loc?.uid || typeof loc.lat !== "number" || typeof loc.lng !== "number") return;

    const entry = {
      uid: loc.uid,
      name: socket.data?.name || null, 
      lat: loc.lat,
      lng: loc.lng,
      updated_at: new Date().toISOString(),
    };
    workerLocations.set(loc.uid, entry);

    io.emit("workers-location", Array.from(workerLocations.values()));
  });

  socket.on("disconnect", () => {
    if (socket.data?.uid) {
      connectedUsers.delete(socket.data.uid);
    }
  });
});


const DB = require('./db/dbConn.js');

DB.createRTables()
  .then((msg) => console.log(msg))
  .catch((err) => console.error("Error creating tables:", err));const notifications = require('./routes/notifications');
app.use('/notifications', notifications);
const map = require('./routes/map');
app.use('/map', map);
const notification = require('./routes/notification');
app.use('/notification', notification);
const cashflowRoutes = require("./routes/cashflow");
app.use("/cashflow", cashflowRoutes);
const inventory = require("./routes/inventory");
app.use("/inventory", inventory);
const uploadFile = require("./routes/uploadFile");
app.use("/uploadFile", uploadFile);
const adminUsers = require("./routes/usersAdmin");
app.use("/admin", adminUsers);

const machines = require('./routes/machines');
const users = require('./routes/users');
const upload = require('./routes/upload');
app.use('/machines', machines);
app.use('/users', users);
app.use('/uploadFile', upload);
app.use("/mechanical", require("./routes/mechanical"));
app.use("/service", require("./routes/service"));


const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/ping', (req, res) => res.json({ ok: true, sid: req.sessionID }));
app.get('/users/session', (req, res) => {
  res.json({
    logged_in: !!req.session?.logged_in,
    user: req.session?.user || null,
    sid: req.sessionID
  });
});

const port = process.env.PORT;
server.listen(port, () => console.log(`Server running on port ${port}`));
