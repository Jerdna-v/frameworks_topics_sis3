const express = require('express');
const router = express.Router();
const DB = require('../db/dbConn');

router.get('/machines', async (req, res) => {
  try {
    const rows = await DB.getAllMachines();
    const machines = rows.map(r => ({
      mid: r.mid,
      name: r.name,
      type: r.type,
      location: r.location,
      startDate: r.startDate,
      latitude: r.latitude,
      longitude: r.longitude
    }));
    res.json({ success: true, machines });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Failed to load machines' });
  }
});

router.post('/machines', async (req, res) => {
  try {
    const {
      mid,
      name,
      type,
      isStore,
      locationText,
      coordinates,
      useCurrent,
      startDateTime
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ success: false, msg: 'Name is required' });
    }

    const toMySQLDateTime = (dt) => {
      if (!dt) return null;
      return dt.replace('T', ':').replace(/$/, ':00').replace(/:(\d{2}):(\d{2}):(\d{2})$/, ' $1:$2:$3');
    };
    const nowMySQL = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const startDT = useCurrent ? nowMySQL : (toMySQLDateTime(startDateTime) || nowMySQL);

    const loc = isStore ? 'Store (no location)' : (locationText || null);
    const lat = isStore || !coordinates ? null : Number(coordinates[0]);
    const lng = isStore || !coordinates ? null : Number(coordinates[1]);

    let newMid;

    if (mid) {
      await DB.insertMachine(mid);
      await DB.updateMachine(mid, name, type || null, loc, lat, lng, startDT);
      newMid = mid;
    } else {
      const ins = await DB.addMachine(name, type || null, loc, lat, lng, startDT);
      newMid = ins.insertId;
    }

    const row = await DB.oneMachine(newMid);
    const machine = row && row[0] ? row[0] : null;

    res.json({ success: true, machine });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Failed to add machine' });
  }
});

module.exports = router;
