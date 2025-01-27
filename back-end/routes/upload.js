const multer = require('multer');
const express = require("express")
const upload = express.Router();
const DB = require('../db/dbConn.js')
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
  })
  
// Configure Multer,
let upload_dest = multer({ dest: 'uploads/' })

// Helper function to parse and extract data
function parseFileContent(content) {
  const data = {
      selections: [],
      priceBands: [],
      failures: [],
      coinMechData: {},
      report: {},
  };

  // Example regex patterns (update based on actual file structure)
  const selectionRegex = /Selection\s+(\d+):\s+(\d+)/g;
  const priceBandRegex = /Band\s+(\d+):\s+(\d+)/g;
  const failureRegex = /Failure\s+(\d+):\s+(\d+)/g;
  const coinMechRegex = /Coin\s+(\d+):\s+(\d+)/g;
  const totalRegex = /Total\s+Count:\s+(\d+)/;

  let match;

  // Extract selections
  while ((match = selectionRegex.exec(content)) !== null) {
      data.selections.push(parseInt(match[2], 10));
  }

  // Extract price bands
  while ((match = priceBandRegex.exec(content)) !== null) {
      data.priceBands.push(parseInt(match[2], 10));
  }

  // Extract failures
  while ((match = failureRegex.exec(content)) !== null) {
      data.failures.push(parseInt(match[2], 10));
  }

  // Extract coin mechanism data
  while ((match = coinMechRegex.exec(content)) !== null) {
      data.coinMechData[`coin_${match[1]}`] = parseInt(match[2], 10);
  }

  // Extract total count
  match = totalRegex.exec(content);
  if (match) {
      data.report.total_count = parseInt(match[1], 10);
  }

  return data;
}

function extractMid(content) {
  const operCodeRegex = /OPER\. CODE ENTRY\s+Cod\.\s+=\s+(\d+)/;
  const progMachineCodeRegex = /PROGR\. MACHINE CODE\s+Cod\.\s+=\s+(\d+)/;

  const operMatch = operCodeRegex.exec(content);
  const progMatch = progMachineCodeRegex.exec(content);

  if (!operMatch || !progMatch) {
      throw new Error("MID not found in the file.");
  }

  const operMid = parseInt(operMatch[1], 10);
  const progMid = parseInt(progMatch[1], 10);

  if (operMid !== progMid) {
      throw new Error("MID mismatch between OPER. CODE ENTRY and PROGR. MACHINE CODE.");
  }

  return operMid;
}

upload.post('/', upload_dest.single('file'), async (req, res, next) => {
  const file = req.file;
  if (!file) {
      return res.send({ status: { success: false, msg: "Could not upload" } });
  }

  try {
      const content = fs.readFileSync(file.path, 'utf8');

      // Extract MID
      const mid = extractMid(content);

      // Parse the rest of the file content
      const data = parseFileContent(content);

      // Insert into Reports table
      const reportData = { ...data.report, mid };
      const reportResult = await DB.insertReport(reportData);
      const rid = reportResult.insertId;

      // Insert into Selections table
      await DB.insertSelections(rid, mid, data.selections);

      // Insert into PriceBands table
      await DB.insertPriceBands(rid, mid, data.priceBands);

      // Insert into Failures table
      await DB.insertFailures(rid, mid, data.failures);

      // Insert into CoinMechData table
      await DB.insertCoinMechData(rid, mid, data.coinMechData);

      res.send({ status: { success: true, msg: "File processed and data inserted" } });
  } catch (err) {
      console.error(err);
      res.status(500).send({ status: { success: false, msg: err.message } });
  }
});


module.exports = upload

