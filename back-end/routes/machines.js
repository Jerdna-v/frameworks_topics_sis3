const express = require("express");
const machines = express.Router();
const DB = require("../db/dbConn.js");
const multer = require("multer");

const upload_dest = multer({ dest: "uploads/" });

machines.get("/", async (req, res, next) => {
  try {
    const rows = await DB.getAllMachines();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    next();
  }
});

machines.get("/:id", async (req, res, next) => {
  try {
    const rows = await DB.oneMachine(req.params.id);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    next();
  }
});

machines.get("/:mid/info", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const rows = await DB.oneMachine(mid);
    const m = Array.isArray(rows) ? rows[0] : rows;
    if (!m) return res.status(404).json({ msg: "Not found" });

    res.json({
      mid: m.mid,
      name: m.name,
      type: m.type,
      location: m.location,
      startDate: m.startDate,
      latitude: m.latitude,
      longitude: m.longitude,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

machines.put("/:mid", async (req, res) => {
  try {
    if (!req.session?.logged_in) {
      return res.status(200).json({ success: false, msg: "Login required" });
    }

    const mid = Number(req.params.mid);
    const {
      name = null,
      type = null,
      location = null,
      startDate = null,
      latitude = null,
      longitude = null,
    } = req.body || {};

    const r = await DB.updateMachine(
      mid,
      name,
      type,
      location ?? "Store",
      latitude,
      longitude,
      startDate
    );

    return res.json({
      success: r?.affectedRows > 0,
      msg: r?.affectedRows ? "Machine updated" : "No changes",
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

machines.post("/", upload_dest.single("file"), async (req, res, next) => {
  try {
    if (!req.session?.logged_in) {
      return res.status(200).json({
        success: false,
        msg: "Can not add machine. You need to log-in!",
      });
    }

    const {
      mid,
      name,
      type = null,
      location = null,
      startDate = null,
      latitude = null,
      longitude = null,
    } = req.body || {};

    if (!name) {
      return res.status(200).json({ success: false, msg: "Name is required" });
    }

    let newMid;
    if (mid) {
      await DB.insertMachine(Number(mid)); 
      await DB.updateMachine(
        Number(mid),
        name,
        type,
        location ?? "Store",
        latitude ? Number(latitude) : null,
        longitude ? Number(longitude) : null,
        startDate || null
      );
      newMid = Number(mid);
    } else {
      const r = await DB.addMachine(
        name,
        type,
        location ?? "Store",
        latitude ? Number(latitude) : null,
        longitude ? Number(longitude) : null,
        startDate || null
      );
      newMid = r.insertId;
    }

    const rows = await DB.oneMachine(newMid);
    const m = Array.isArray(rows) ? rows[0] : rows;
    return res.json({ success: true, machine: m });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
    next();
  }
});

async function getRid(mid, date) {
  const rid = await DB.getReportRidByMidDate(mid, date);
  return rid || null;
}

machines.get("/:mid/product", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const { date, start, end } = req.query;

    if (start && end) {
      const rows = await DB.listProductsByMidRange(mid, start, end);
      return res.json(rows || []);
    }
    if (date) {
      const rows = await DB.listProductsByMidDate(mid, date);
      return res.json(rows || []);
    }
    const rows = await DB.listProducts(mid);
    res.json(rows || []);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});
machines.get("/:mid/cashflow", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const { date, start, end } = req.query;

    if (start && end) {
      const rows = await DB.listCashFlowByMidRange(mid, start, end);
      return res.json(rows || []);
    }
    if (date) {
      const rows = await DB.listCashFlowByMidDate(mid, date);
      return res.json(rows || []);
    }
    const rows = await DB.listCashFlow(mid);
    res.json(rows || []);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

machines.get("/:mid/selections", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const { date, start, end } = req.query;

    if (start && end) {
      const rows = await DB.getSelectionsByMidRange(mid, start, end);
      return res.json(rows || []);
    }
    if (date) {
      const rid = await DB.getReportRidByMidDate(mid, date);
      if (!rid) return res.json([]);
      const rows = await DB.getSelectionsByRid(rid);
      return res.json(rows || []);
    }
    res.json([]);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

machines.get("/:mid/bands", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const { date, start, end } = req.query;

    if (start && end) {
      const rows = await DB.getPriceBandsByMidRange(mid, start, end);
      return res.json(rows || []);
    }
    if (date) {
      const rid = await DB.getReportRidByMidDate(mid, date);
      if (!rid) return res.json([]);
      const rows = await DB.getPriceBandsByRid(rid);
      return res.json(rows || []);
    }
    res.json([]);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

machines.get("/:mid/mech", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const { date, start, end } = req.query;

    if (start && end) {
      const rows = await DB.getCoinMechByMidRange(mid, start, end);
      return res.json(rows || []);
    }
    if (date) {
      const rid = await DB.getReportRidByMidDate(mid, date);
      if (!rid) return res.json([]);
      const rows = await DB.getCoinMechByRid(rid);
      return res.json(rows || []);
    }
    res.json([]);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

machines.get("/:mid/failures", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const { date, start, end } = req.query;

    if (start && end) {
      const rows = await DB.getFailuresByMidRange(mid, start, end);
      return res.json(rows || []);
    }
    if (date) {
      const rid = await DB.getReportRidByMidDate(mid, date);
      if (!rid) return res.json([]);
      const rows = await DB.getFailuresByRid(rid);
      return res.json(rows || []);
    }
    res.json([]);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

machines.get("/:mid/totals", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    const { date, start, end } = req.query;

    if (start && end) {
      const rows = await DB.getReportTotalsByMidRange(mid, start, end);
      return res.json(rows || []);
    }
    if (date) {
      const rid = await DB.getReportRidByMidDate(mid, date);
      if (!rid) return res.json([]);
      const rows = await DB.getReportTotalsByRid(rid);
      return res.json(rows || []);
    }
    res.json([]);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

machines.get("/:mid/predict-refill", async (req, res) => {
  try {
    res.json({ suggestion: "Not implemented yet" });
  } catch (e) {
    console.error(e);
    res.json({ suggestion: "error" });
  }
});
// Simple validation route for frontend checks
machines.get("/:mid/check", async (req, res) => {
  try {
    const mid = Number(req.params.mid);
    if (!mid) return res.json({ exists: false });

    const rows = await DB.oneMachine(mid);
    const machine = Array.isArray(rows) ? rows[0] : rows;

    if (!machine) {
      return res.json({ exists: false });
    }

    return res.json({
      exists: true,
      mid: machine.mid,
      name: machine.name || "(no name)",
      type: machine.type || null,
      location: machine.location || null,
    });
  } catch (err) {
    console.error("Machine check error:", err);
    return res.status(500).json({ exists: false, msg: "Database error" });
  }
});

module.exports = machines;
  