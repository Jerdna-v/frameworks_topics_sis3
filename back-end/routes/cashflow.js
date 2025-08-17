const express = require("express");
const router = express.Router();
const DB = require("../db/dbConn");


router.post("/bulk", async (req, res) => {
  try {
    const { current, date, time, mid, items } = req.body || {};

    if (!mid || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "mid and items are required." });
    }

    let dateTime;
    if (current) {
      dateTime = new Date();
    } else {
      if (!date || !time) {
        return res.status(400).json({ msg: "date and time are required unless current=true." });
      }
      const iso = `${date}T${time}:00`;
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ msg: "Invalid date/time." });
      }
      dateTime = d;
    }

    const pad2 = (n) => String(n).padStart(2, "0");
    const dt = `${dateTime.getFullYear()}-${pad2(dateTime.getMonth() + 1)}-${pad2(dateTime.getDate())} ${pad2(dateTime.getHours())}:${pad2(dateTime.getMinutes())}:${pad2(dateTime.getSeconds())}`;

    await DB.addCashFlowBulk(dt, Number(mid), items);

    return res.json({ msg: "Cash flow saved." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error." });
  }
});


router.get("/", async (req, res) => {
  try {
    const mid = req.query.mid ? Number(req.query.mid) : null;
    const rows = await DB.listCashFlow(mid);
    return res.json({ cashflows: rows });
  } catch (err) {
    console.error("cashflow list error:", err);
    return res.status(500).json({ msg: "Database error." });
  }
});
router.post("/", async (req, res) => {
  const { date, mid, cashtype, amount, description } = req.body || {};
  if (!date || !mid || !cashtype || !amount) {
    return res.status(400).json({ msg: "All fields are required." });
  }
  try {
    await DB.addCashFlow(date, Number(mid), cashtype, Number(amount), description || null);
    res.json({ msg: "Cash flow record inserted successfully." });
  } catch (err) {
    console.error("Error inserting cashflow:", err);
    res.status(500).json({ msg: "Database error." });
  }
});

module.exports = router;
