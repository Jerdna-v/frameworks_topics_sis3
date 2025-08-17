const express = require("express");
const router = express.Router();
const multer = require("multer");
const DB = require("../db/dbConn.js");

const upload = multer({ storage: multer.memoryStorage() });
const now = new Date();                       
const reportDateTime = now.toISOString().slice(0,19).replace('T',' ');

function toMySQLDateTime(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function parseMid(text) {
  const reList = [
    /OPER\.\s*CODE\s*ENTRY\s*Cod\.\s*=\s*0*([0-9]{1,})/i,
    /PROGR\.\s*MACHINE\s*CODE\s*Cod\.\s*=\s*0*([0-9]{1,})/i,
    /\bCod\.\s*=\s*0*([0-9]{1,})/i
  ];
  for (const re of reList) {
    const m = text.match(re);
    if (m && m[1]) return parseInt(m[1], 10);
  }
  return null;
}

function parseTotals(text) {
  const num = (re) => {
    const m = text.match(re);
    return m ? parseInt(m[1], 10) : undefined;
  };
  return {
    total_count:       num(/TOTAL\s+COUNT\s+([-\d]+)/i),
    full_sel_norm:     num(/Full sel\.? in norm\.o\.\s*Total\s*=\s*([-\d]+)/i),
    full_sel_maint:    num(/Full sel in mainten\.\s*Total\s*=\s*([-\d]+)/i),
    total_selections:  num(/TOTAL\s+Total\s*=\s*([-\d]+)/i)
  };
}

function parseSelections(text) {
  const rows = [];
  const re = /SELECTION\s+NUM\.\s*(\d+)[^\n]*\n\s*Total\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    rows.push({ type: `selection_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }
  return rows;
}

function parsePriceBands(text) {
  const rows = [];
  const reBand = /Band\s+(\d+)\s*Total\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = reBand.exec(text))) {
    rows.push({ type: `band_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }
  const free = text.match(/Free\s+Total\s*=\s*([-\d]+)/i);
  if (free) rows.push({ type: "free", amount: parseInt(free[1],10), description: "" });
  return rows;
}

function parseFailures(text) {
  const rows = [];
  const re = /\n\s*([A-Za-z0-9 .]+?)\s+Counter\s*=\s*([-\d]+)/g;
  let within = false;
  for (const line of text.split(/\r?\n/)) {
    if (/FAILURE\s+COUNT/i.test(line)) { within = true; continue; }
    if (within && /^\s*-{2,}\s*$/.test(line)) break;
  }
  let m;
  while ((m = re.exec(text))) {
    const label = m[1].trim().replace(/\s+/g, "_").toLowerCase();
    rows.push({ type: label, amount: parseInt(m[2],10), description: "" });
  }
  return rows;
}

function parseCoinMech(text) {
  const rows = [];

  const auditRe = /Audit\s+(\d+)[^\S\r\n]*\r?\n\s*Tot\.\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = auditRe.exec(text))) {
    rows.push({
      type: `audit_${m[1]}`,
      amount: parseInt(m[2], 10) || 0,
      description: ""
    });
  }

  const coinRe = /Coin\s+N\.\s*(\d+)[^\n]*\n\s*Total\s*=\s*([-\d]+)/gi;
  while ((m = coinRe.exec(text))) {
    rows.push({
      type: `coin_${m[1]}`,
      amount: parseInt(m[2], 10) || 0,
      description: ""
    });
  }

  const totals = [
    { re: /TOTAL\s+CASH\s+Tot\.\s*=\s*([-\d]+)/i, key: "total_cash" },
    { re: /TOTAL\s+SALES\s+Tot\.\s*=\s*([-\d]+)/i, key: "total_sales" },
    { re: /TOTAL\s+CASH\s+x\s+CRED\.\s*Tot\.\s*=\s*([-\d]+)/i, key: "total_cash_credit" },
  ];
  for (const t of totals) {
    const mm = text.match(t.re);
    if (mm) {
      rows.push({
        type: t.key,
        amount: parseInt(mm[1], 10) || 0,
        description: ""
      });
    }
  }

  return rows;
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file provided" });
    }
    const text = req.file.buffer.toString("utf8");

    const uid = req.session?.user?.uid || 1;

    let mid = parseMid(text);
    if (!mid && req.body?.mid) mid = parseInt(req.body.mid, 10);
    if (!mid) {
      return res.status(400).json({ success: false, msg: "Machine ID (mid) not found in file." });
    }

    const exists = await DB.checkMachineExists(mid);
    if (!exists) {
      const now = toMySQLDateTime(new Date());
      await DB.insertMachine(mid, now); 
    }

    const uploadTime = toMySQLDateTime(new Date());
await DB.ensureMachine(mid, reportDateTime.split(' ')[0]);

const rid = await DB.insertReport(/* uid */ uploaderUid, /* mid */ mid, /* date_time */ reportDateTime);
    const totals = parseTotals(text);
    const selections = parseSelections(text);
    const bands = parsePriceBands(text);
    const failures = parseFailures(text);
    const coin = parseCoinMech(text);

    if (selections.length) await DB.insertSelections(rid, selections);
    if (bands.length) await DB.insertPriceBands(rid, bands);
    if (failures.length) await DB.insertFailures(rid, failures);
    if (coin.length) {
      const coinMap = Object.fromEntries(coin.map(c => [c.type, c.amount]));
      await DB.insertCoinMechData(rid, coinMap);
    }
    const totalsRows = [
      { type: "total_count",       amount: totals.total_count,      description: "" },
      { type: "full_sel_norm",     amount: totals.full_sel_norm,    description: "" },
      { type: "full_sel_maint",    amount: totals.full_sel_maint,   description: "" },
      { type: "total_selections",  amount: totals.total_selections, description: "" },
    ].filter(r => Number.isFinite(r.amount));
    if (totalsRows.length) await DB.insertReportTotals(rid, totalsRows);

    return res.json({
      success: true,
      msg: "Report ingested successfully.",
      rid,
      mid,
      uploaded_at: uploadTime
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;
