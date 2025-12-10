const express = require("express");
const router = express.Router();
const DB = require("../db/dbConn");

router.post("/", async (req, res) => {
  try {
    const { current, date, time, mid, mechanical } = req.body || {};
    const uid = req.session?.user?.uid;

    if (!uid) {
      return res.status(401).json({ msg: "Not logged in." });
    }
    if (!mid && mid !== 0) {
      return res.status(400).json({ msg: "mid is required." });
    }

    const mech = parseInt(mechanical, 10);
    if (!Number.isFinite(mech) || mech < 0) {
      return res
        .status(400)
        .json({ msg: "mechanical must be a non-negative integer." });
    }

    let dateTime;
    if (current) {
      dateTime = new Date();
    } else {
      if (!date || !time) {
        return res.status(400).json({
          msg: "date and time are required unless current=true.",
        });
      }
      const d = new Date(`${date}T${time}:00`);
      if (isNaN(d.getTime()))
        return res.status(400).json({ msg: "Invalid date/time." });
      dateTime = d;
    }

    const pad2 = (n) => String(n).padStart(2, "0");
    const dt =
      `${dateTime.getFullYear()}-${pad2(dateTime.getMonth() + 1)}-${pad2(
        dateTime.getDate()
      )} ` +
      `${pad2(dateTime.getHours())}:${pad2(dateTime.getMinutes())}:${pad2(
        dateTime.getSeconds()
      )}`;

    await DB.addMechanical(dt, Number(mid), uid, mech);

    return res.json({ msg: "Mechanical saved." });
  } catch (err) {
    console.error("mechanical post error:", err);
    return res.status(500).json({ msg: "Server error." });
  }
});

router.get("/", async (req, res) => {
  try {
    const mid = req.query.mid ? Number(req.query.mid) : null;
    const rows = await DB.listMechanical(mid);
    return res.json({ mechanical: rows });
  } catch (err) {
    console.error("mechanical list error:", err);
    return res.status(500).json({ msg: "Database error." });
  }
});

module.exports = router;
