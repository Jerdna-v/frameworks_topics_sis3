const express = require("express");
const users = express.Router();
const crypto = require("crypto");
const DB = require("../db/dbConn.js");

const sha256 = (txt) =>
  crypto.createHash("sha256").update(String(txt)).digest("hex");

const safeUser = (row) => {
  return {
    uid: row.uid,
    username: row.username,
    name: row.name,
    phone_number: row.phone_number,
    type: row.type, 
  };
};


users.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(200).json({
        user: null,
        status: { success: false, msg: "Input element missing" },
      });
    }

    const rows = await DB.AuthUser(username);
    if (!rows || rows.length === 0) {
      return res.status(200).json({
        user: null,
        status: { success: false, msg: "Username not registsred" },
      });
    }

    const userRow = rows[0];
    const incomingHash = crypto.createHash("sha256").update(String(password)).digest("hex");
    if (incomingHash !== userRow.password) {
      return res.status(200).json({
        user: null,
        status: { success: false, msg: "Username or password incorrect" },
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regenerate error:", err);
        return res.sendStatus(500);
      }
      req.session.user = {
        uid: userRow.uid,
        username: userRow.username,
        name: userRow.name,
        phone_number: userRow.phone_number,
        type: userRow.type,
      };
      req.session.logged_in = true;

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
          return res.sendStatus(500);
        }
        return res.status(200).json({
          user: req.session.user,
          status: { success: true, msg: "Logged in" },
        });
      });
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

users.get('/session', (req, res) => {
  res.json({
    logged_in: !!req.session.logged_in,
    user: req.session.user || null
  });
});


users.post("/register", async (req, res) => {
  try {
    const { username, password, name, phone } = req.body || {};
    if (!username || !password || !name || !phone) {
      return res
        .status(200)
        .json({ status: { success: false, msg: "A field is missing!" } });
    }

    const existingUser = await DB.AuthUser(username);
    if (existingUser && existingUser.length > 0) {
      return res
        .status(409)
        .json({ status: { success: false, msg: "Username already exists!" } });
    }

    const existingNumber = await DB.AuthNumber(phone);
    if (existingNumber && existingNumber.length > 0) {
      return res.status(409).json({
        status: { success: false, msg: "Phone number already exists!" },
      });
    }

    const currentDateTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const hashed = sha256(password);
    const result = await DB.addUser(username, hashed, name, phone, currentDateTime);

    if (result?.affectedRows) {
      return res
        .status(200)
        .json({ status: { success: true, msg: "New user created" } });
    }

    return res
      .status(500)
      .json({ status: { success: false, msg: "Failed to add user" } });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: { success: false, msg: err.message } });
  }
});

users.post("/forgot", async (req, res) => {
  try {
    const { phone_number } = req.body || {};
    if (!phone_number) {
      return res
        .status(200)
        .json({ status: { success: false, msg: "Phone number required" } });
    }

    const rows = await DB.AuthNumber(phone_number); 
    if (!rows || rows.length === 0) {
      return res
        .status(200)
        .json({ status: { success: false, msg: "No user with that phone" } });
    }

    const userRow = rows[0];
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashed = sha256(tempPassword);

    await DB.updateUserPassword(userRow.uid, hashed);

    return res.status(200).json({
      status: {
        success: true,
        msg: `Temporary password generated. (Demo) New password: ${tempPassword}`,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: { success: false, msg: "Server error" } });
  }
});

users.post("/logout", (req, res) => {
  try {
    req.session.destroy(() => {
      res.status(200).json({ logged_in: false, user: null });
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

users.get("/workers", async (req, res) => {
  try {
    const rows = await DB.getWorkers();
    res.status(200).json(rows);
  } catch (err) {
    console.error("GET /users/workers error:", err);
    res.status(500).json({ msg: "Failed to fetch workers" });
  }
});
users.get("/list", async (req, res) => {
  try {
    const rows = await DB.getAllUsers();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});


users.post("/sendNotification", async (req, res) => {
  try {
    const { wid, mid, title, message, urgent } = req.body || {};
    const workerId = parseInt(wid, 10);
    const machineId = parseInt(mid, 10);

    if (!workerId || !title || !message) {
      return res.status(400).json({ msg: "Missing required fields." });
    }

    if (machineId && !(await DB.checkMachineExists(machineId))) {
      return res.status(400).json({ msg: "Machine does not exist." });
    }

    const inserted = await DB.addNotificationFull(
      workerId,
      machineId || null,
      title,
      message,
      !!urgent
    );

    const io = req.app.locals.io;
    const payload = {
      nid: inserted.insertId,
      worker_id: workerId,
      mid: machineId || null,
      title,
      message,
      urgent: !!urgent,
      is_done: false,
      timestamp: new Date().toISOString()
    };
    io.to(`user:${workerId}`).emit("new-notification", payload);

    res.status(200).json({ msg: "Notification sent.", nid: inserted.insertId });
  } catch (err) {
    console.error("POST /users/sendNotification error:", err);
    res.status(500).json({ msg: "Failed to send notification." });
  }
});

module.exports = users;
