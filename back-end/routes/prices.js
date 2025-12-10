const express = require("express");
const router = express.Router();
const DB = require("../db/dbConn.js");

// -----------------------------------------------------------
// GET unique selections
// -----------------------------------------------------------
router.get("/selections/:mid", async (req, res) => {
  try {
    const mid = parseInt(req.params.mid, 10);
    if (!mid) return res.json({ exists: false, selections: [] });

    const selections = await DB.getUniqueSelections(mid);

    return res.json({
      exists: true,
      selections
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// -----------------------------------------------------------
// GET existing price links for a machine
// -----------------------------------------------------------
router.get("/mapping/:mid", async (req, res) => {
  try {
    const mid = parseInt(req.params.mid, 10);
    if (!mid) return res.json({ exists: false, mapping: [] });

    const mapping = await DB.getPriceLinks(mid);

    return res.json({ exists: true, mapping });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// -----------------------------------------------------------
// SAVE price mappings
// Body: { mid, links: [ { selection, price_group } ] }
// -----------------------------------------------------------
router.post("/save", async (req, res) => {
  try {
    const { mid, links } = req.body;

    if (!mid || !Array.isArray(links)) {
      return res.status(400).json({ msg: "Invalid payload" });
    }

    await DB.insertPriceLinks(mid, links);

    return res.json({ success: true, msg: "Prices saved successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
