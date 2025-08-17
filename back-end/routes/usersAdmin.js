const express = require("express");
const adminUsers = express.Router();
const DB = require("../db/dbConn.js");

adminUsers.get("/users" , async (req, res) => {
  try {
    const rows = await DB.getAllUsers();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
});

adminUsers.put("/users/:uid", async (req, res) => {
  try {
    const uid = parseInt(req.params.uid, 10);
    const { username, name, phone_number, type } = req.body || {};

    if (!uid || !username || !name || !phone_number || !type) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    await DB.updateUserPartial(uid, { username, name, phone_number, type });
    res.json({ msg: "User updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to update user" });
  }
});

module.exports = adminUsers;
