// parsers/generic.js
function parseMid(raw) {
  if (!raw) return null;
  const text = String(raw).replace(/\r/g, "\n").replace(/\^M/g, "\n");

  const candidates = [];

  // Helper: try a regex, push the number if found
  const tryRe = (re) => {
    const m = text.match(re);
    if (m && m[1] != null) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n)) candidates.push(n);
    }
  };

  // 1) Explicit headers (English)
  // "OPER. CODE ENTRY" ... "Code = 000157"
  tryRe(/OPER\.?\s*CODE\s*ENTRY[\s\S]{0,60}?(?:Cod(?:\.|)|Code)\s*=?\s*0*([0-9]+)/i);
  // "PRG.MACHINE CODE" / "PROG. MACHINE CODE" ... "Code = 00000157"
  tryRe(/(?:PRG\.?|PROG\.?|PROGR\.?)\s*\.?\s*MACH(?:INE)?\s*CODE[\s\S]{0,60}?(?:Cod(?:\.|)|Code)\s*=?\s*0*([0-9]+)/i);

  // 2) Italian headers that often appear
  // "PROG. COD. GEST." ... "Cod. = 000000"  (gestore/manager code; can be 0)
  tryRe(/PROG\.?\s*\.?\s*COD\.?\s*\.?\s*GEST\.?[\s\S]{0,60}?(?:Cod(?:\.|)|Codice(?:\s*g\.)?)\s*=?\s*0*([0-9]+)/i);

  // "PROGRAMM. CODICE DA" ... "Cod. DA = 00000000"  (DA sometimes without dots)
  tryRe(/PROGRAMM\.?\s*\.?\s*CODICE\s*DA[\s\S]{0,60}?Cod\.?\s*D\.?\s*A\.?\s*=\s*0*([0-9]+)/i);
  tryRe(/PROGRAMM\.?\s*\.?\s*CODICE\s*DA[\s\S]{0,60}?Cod\.?\s*DA\s*=\s*0*([0-9]+)/i);

  // 3) French FSE legacy (keep your old cases)
  tryRe(/Cod\.?\s*D\.?\s*A\.?\s*=\s*0*([0-9]+)/i);   // "Cod. D.A. = ..."
  tryRe(/Code\s*D\.?\s*A\.?\s*=\s*0*([0-9]+)/i);     // "Code D.A. = ..."

  // 4) Very loose fallback: any "Code = ..." or "Cod. = ..."
  // (Appears a lot in Snakky/Sfera with the right number on the next line)
  tryRe(/(?:Cod(?:ice)?|Code)\s*=?\s*0*([0-9]+)/i);

  // Prefer the first non-zero item (ignore 0/000000 where present)
  const nonZero = candidates.find((n) => n > 0);
  if (Number.isFinite(nonZero)) return nonZero;

  // Otherwise, if everything is zero, return 0 (or null). Null forces caller to read req.body.mid.
  return null;
}


// Returns an ARRAY of rows ready for DB.insertReportTotals(...)
function parseTotals(text) {
  const num = (re) => {
    const m = text.match(re);
    return m ? parseInt(m[1], 10) : undefined;
  };

  const rows = [
    { key: "total_count",       re: /TOTAL\s+COUNT\s+([-\d]+)/i },
    { key: "full_sel_norm",     re: /Full sel\.? in norm\.o\.\s*Total\s*=\s*([-\d]+)/i },
    { key: "full_sel_maint",    re: /Full sel in mainten\.\s*Total\s*=\s*([-\d]+)/i },
    { key: "total_selections",  re: /TOTAL\s+Total\s*=\s*([-\d]+)/i },
    { key: "total_cash",        re: /TOTAL\s+CASH\s+Tot\.\s*=\s*([-\d]+)/i },
    { key: "total_sales",       re: /TOTAL\s+SALES\s+Tot\.\s*=\s*([-\d]+)/i },
    { key: "total_cash_credit", re: /TOTAL\s+CASH\s+x\s+CRED\.\s*Tot\.\s*=\s*([-\d]+)/i }
  ].map(({ key, re }) => {
    const val = num(re);
    return Number.isFinite(val) ? { type: key, amount: val, description: "" } : null;
  }).filter(Boolean);

  return rows;
}

// Generic selection rows (covers "SELECTION NUM." and "SELECTION N.")
function parseSelections(text) {
  const rows = [];
  const re = /SELECTION\s+N(?:UM)?\.\s*(\d+)[\s\S]*?Total\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    rows.push({ type: `selection_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }
  return rows;
}

// Bands + common extras (Free, Discount, Extra Price) if present
function parsePriceBands(text) {
  const rows = [];
  const reBand = /Band\s+(\d+)\s*[^\n]*\n?Total\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = reBand.exec(text))) {
    rows.push({ type: `band_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }

  const free = text.match(/Free[^\n]*\n?Total\s*=\s*([-\d]+)/i);
  if (free) rows.push({ type: "free", amount: parseInt(free[1],10), description: "" });

  const discount = text.match(/DISCOUNT[^\n]*\n?Tot\.\s*=\s*([-\d]+)/i);
  if (discount) rows.push({ type: "discount", amount: parseInt(discount[1],10), description: "" });

  const extra = text.match(/EXTRA\s+PRICE[^\n]*\n?Tot\.\s*=\s*([-\d]+)/i);
  if (extra) rows.push({ type: "extra_price", amount: parseInt(extra[1],10), description: "" });

  const over = text.match(/OVER-PRICE[^\n]*\n?Tot\.\s*=\s*([-\d]+)/i);
  if (over) rows.push({ type: "over_price", amount: parseInt(over[1],10), description: "" });

  return rows;
}

// Failure lines like: "<LABEL>  Counter = <num>"
function parseFailures(text) {
  const rows = [];
  const re = /\s*([A-Za-z0-9 .]+?)\s+Counter\s*=?\s*([-\d]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    rows.push({
      type: m[1].trim().replace(/\s+/g,"_").toLowerCase(),
      amount: parseInt(m[2],10),
      description: ""
    });
  }
  return rows;
}

// Coin mech: "Coin N. X ... Total = Y"
function parseCoinMech(text) {
  const rows = [];
  const coinRe = /Coin\s+N\.\s*(\d+)[^\n]*\n?Total\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = coinRe.exec(text))) {
    rows.push({ type: `coin_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }
  return rows;
}

module.exports = {
  parseMid,
  parseTotals,
  parseSelections,
  parsePriceBands,
  parseFailures,
  parseCoinMech
};
