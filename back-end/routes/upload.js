const multer = require('multer');
const express = require("express");
const upload = express.Router();
const DB = require('../db/dbConn.js');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads');
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`);
    }
});

let upload_dest = multer({ dest: 'uploads/' });

// Helper function to extract MID
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

// Helper function to parse file content
function parseFileContent(content) {
  const data = {
    selections: Array(40).fill(0),
    priceBands: Array(10).fill(0), // Adjusted for one additional price band
    failures: Array(41).fill(0),
    coinMechData: {
      coin_1: 0,
      coin_2: 0,
      coin_3: 0,
      coin_4: 0,
      coin_5: 0,
      coin_6: 0,
      total_cash: 0,
      total_sales: 0,
      total_cash_credit: 0,
    },
    report: { total_count: 0, full_sel_norm: 0, full_sel_maint: 0, total_selections: 0 },
  };

  // Updated regex patterns
  const selectionRegex = /SELECTION NUM\.\s*(\d+)\s*Total\s*=\s*(\d+)/gi;
  const priceBandRegex = /Band\s*(\d+)\s*Total\s*=\s*(\d+)/gi;
  const failureRegex = /Counter\s*=\s*(\d+)/gi;
  const coinMechRegex = /Coin N\.\s*(\d+)\s*Total\s*=\s*(\d+)/gi;
  const totalCountRegex = /TOTAL COUNT\s*(\d+)/i;
  const normRegex = /Full sel\. in norm\.\s*Total\s*=\s*(\d+)/i;
  const maintRegex = /Full sel in mainten\.\s*Total\s*=\s*(\d+)/i;
  const totalSelectionsRegex = /TOTAL\s*=\s*(\d+)\s*----------------/i;
  const totalCashRegex = /TOTAL CASH\s*Tot\.\s*=\s*(\d+)/i;
  const totalSalesRegex = /TOTAL SALES\s*Tot\.\s*=\s*(\d+)/i;
  const totalCashCreditRegex = /TOTAL CASH x CRED\.\s*Tot\.\s*=\s*(\d+)/i;

  let match;

  // Extract selections
  while ((match = selectionRegex.exec(content)) !== null) {
    const index = parseInt(match[1], 10);
    const value = parseInt(match[2], 10);
    if (index >= 1 && index <= 40) {
      data.selections[index - 1] = value;
    }
  }

  // Extract price bands (including one extra for "Free")
  while ((match = priceBandRegex.exec(content)) !== null) {
    const index = parseInt(match[1], 10);
    const value = parseInt(match[2], 10);
    if (index >= 0 && index < 10) {
      data.priceBands[index] = value;
    }
  }

  // Extract failures
  let failureIndex = 0;
  while ((match = failureRegex.exec(content)) !== null && failureIndex < 41) {
    data.failures[failureIndex++] = parseInt(match[1], 10);
  }

  // Extract coin mechanism data
  while ((match = coinMechRegex.exec(content)) !== null) {
    const coinKey = `coin_${match[1]}`;
    if (data.coinMechData.hasOwnProperty(coinKey)) {
      data.coinMechData[coinKey] = parseInt(match[2], 10) || 0;
    }
  }

  // Extract total counts and selections
  match = totalCountRegex.exec(content);
  if (match) data.report.total_count = parseInt(match[1], 10);

  match = normRegex.exec(content);
  if (match) data.report.full_sel_norm = parseInt(match[1], 10);

  match = maintRegex.exec(content);
  if (match) data.report.full_sel_maint = parseInt(match[1], 10);

  match = totalSelectionsRegex.exec(content);
  if (match) data.report.total_selections = parseInt(match[1], 10);

  // Extract total cash, sales, and cash credit
  match = totalCashRegex.exec(content);
  if (match) data.coinMechData.total_cash = parseInt(match[1], 10);

  match = totalSalesRegex.exec(content);
  if (match) data.coinMechData.total_sales = parseInt(match[1], 10);

  match = totalCashCreditRegex.exec(content);
  if (match) data.coinMechData.total_cash_credit = parseInt(match[1], 10);

  // Debugging logs to verify extracted data
  console.log("Selections Data:", data.selections);
  console.log("PriceBands Data:", data.priceBands);
  console.log("Failures Data:", data.failures);
  console.log("CoinMechData:", data.coinMechData);
  console.log("Report Data:", data.report);

  return data;
}



upload.post('/', upload_dest.single('file'), async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send({ success: false, msg: "No file uploaded." });
  }

  try {
    // Read the file content
    const rawContent = fs.readFileSync(file.path, 'utf8');
    console.log("Raw File Content:", rawContent);

    // Split into lines and join into a single string, removing \r characters
    const lines = rawContent.split(/\r?\n/);
    console.log("Lines in File:", lines);

    // Combine lines back into a single string and remove `\r`
    const content = lines.join("\n").replace(/\r/g, "");
    console.log("Processed Content:", content);

    // Extract MID and parse content
    const mid = extractMid(content);
    const data = parseFileContent(content);

    // Process data
    const machineExists = await DB.checkMachineExists(mid);
    if (!machineExists) {
      await DB.insertMachine(mid);
    }

    const rid = await DB.insertReport(mid, data.report);
    await DB.insertSelections(rid, mid, data.selections);
    await DB.insertPriceBands(rid, mid, data.priceBands);
    await DB.insertFailures(rid, mid, data.failures);
    await DB.insertCoinMechData(rid, mid, data.coinMechData);

    res.status(200).send({ success: true, msg: "File processed successfully." });
  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).send({ success: false, msg: err.message });
  }
});
module.exports = upload;
