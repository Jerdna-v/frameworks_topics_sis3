const express = require("express");
const router = express.Router();
const DB = require("../db/dbConn.js");

router.get("/", async (req, res) => {
  try {
    const sessionUser = req.session?.user || null;
    const q = req.query || {};
    const wantAll = q.all === "1" || q.all === "true";
    const queryUid = q.uid ? Number(q.uid) : null;

    let rows;

    if (sessionUser?.type === "owner" || sessionUser?.type === "manager") {
      rows = await DB.getNotifications(wantAll ? null : queryUid);
    } else {
      const uid = queryUid ?? sessionUser?.uid ?? null;
      if (!uid) {
        return res.status(200).json([]);
      }
      rows = await DB.getNotifications(uid);
    }

    return res.status(200).json(rows || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json([]);
  }
});

router.post("/send", async (req, res) => {
  try {
    const { uid, mid, title, message, urgent } = req.body || {};
    if (!uid || !title) {
      return res.status(400).json({ success: false, msg: "uid and title are required" });
    }

    const createdRow = await DB.addNotificationFull(
      Number(uid),
      mid ? Number(mid) : null,
      title,
      message || "",
      !!urgent
    );

    const io = req.app.locals.io;
    if (io && createdRow?.uid) {
      io.to(`user:${createdRow.uid}`).emit("new-notification", createdRow);
    }

    return res.json({
      success: true,
      msg: "Notification stored",
      notification: createdRow,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});


router.post("/done", async (req, res) => {
  try {
    const { nid } = req.body || {};
    const sessionUser = req.session?.user || null;

    if (!nid) {
      return res.status(400).json({ success: false, msg: "nid required" });
    }

    await DB.markNotificationDone(Number(nid));

    const io = req.app.locals.io;
    if (io) {
      io.emit("notification-done", { nid, doneBy: sessionUser?.uid || null });
    }

    return res.status(200).json({ success: true, msg: "Marked as done" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;
