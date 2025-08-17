const express = require("express");
const router = express.Router();
const DB = require("../db/dbConn");

router.get("/", async (req, res) => {
  try {
    const { uid, all } = req.query;
    if (all) {
      const rows = await DB.getNotifications(null); // return all
      return res.json(rows);
    }
    const rows = await DB.getNotifications(uid ? Number(uid) : null);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ notifications: [] });
  }
});

router.post("/send", async (req, res) => {
  try {
    const { uid, mid, title, message, urgent } = req.body || {};
    if (!uid || !title) {
      return res.status(400).json({ success: false, msg: "uid and title are required" });
    }

    const r = await DB.addNotificationFull(
      Number(uid),
      mid ? Number(mid) : null,
      title,
      message || "",
      !!urgent
    );

    return res.json({ success: true, nid: r.insertId, msg: "Notification stored" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

router.post("/done", async (req, res) => {
  try {
    const { nid } = req.body || {};
    if (!nid) return res.status(400).json({ success: false, msg: "nid required" });

    await DB.markNotificationDone(Number(nid));
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;
