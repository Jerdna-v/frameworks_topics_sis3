const express = require("express");
const router = express.Router();
const multer = require("multer");
const DB = require("../db/dbConn.js");
const parsers = require("../parsers");

const upload = multer({ storage: multer.memoryStorage() });
const now = new Date();                       
const reportDateTime = now.toISOString().slice(0,19).replace('T',' ');

function toMySQLDateTime(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

router.post("/", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, msg: "No files provided" });
    }

    const uid = req.session?.user?.uid || 1;
    const uploadedResults = [];

    for (const file of req.files) {
      const text = file.buffer.toString("utf8");

      // Parse Machine ID
      let mid = parsers.generic.parseMid(text);
      if (!mid && req.body?.mid) mid = parseInt(req.body.mid, 10);
      if (!mid) {
        uploadedResults.push({
          file: file.originalname,
          success: false,
          msg: "Machine ID not found in file."
        });
        continue;
      }

      // Ensure machine exists
      if (!await DB.checkMachineExists(mid)) {
        await DB.insertMachine(mid, toMySQLDateTime());
      }

      const rid = await DB.insertReport(uid, mid, toMySQLDateTime());

      // Select parser
      let data;
      if (/BRIO/i.test(text)) {
        data = parsers.brio(text);
      } else if (/VENEZIA/i.test(text) || /FSE/i.test(text)) {
        data = parsers.zanussi(text, false);
      } else if (/COLIBRI/i.test(text)) {
        data = { totals: parsers.colibri(text) };
      } else if (/KIKKO/i.test(text)) {
        data = parsers.kikko(text);
      } else if (/(SNAKKY|SFERA)/i.test(text)) {
        data = parsers.snakky(text);
      } else {
        data = {
          totals: parsers.generic.parseTotals(text),
          selections: parsers.generic.parseSelections(text),
          bands: parsers.generic.parsePriceBands(text),
          failures: parsers.generic.parseFailures(text),
          coins: parsers.generic.parseCoinMech(text)
        };
      }

      // Insert to DB
      if (data.selections?.length) await DB.insertSelections(rid, data.selections);
      if (data.prices?.length) await DB.insertPriceBands(rid, data.prices);
      if (data.bands?.length) await DB.insertPriceBands(rid, data.bands);
      if (data.failures?.length) await DB.insertFailures(rid, data.failures);
      if (data.coins?.length) {
        const coinMap = Object.fromEntries(data.coins.map(c => [c.type, c.amount]));
        await DB.insertCoinMechData(rid, coinMap);
      }
      if (data.totals?.length) await DB.insertReportTotals(rid, data.totals);

      uploadedResults.push({
        file: file.originalname,
        success: true,
        rid,
        mid,
      });
    }

    return res.json({
      success: true,
      msg: "Files ingested.",
      results: uploadedResults
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});


module.exports = router;
