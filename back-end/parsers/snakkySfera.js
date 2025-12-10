// parsers/snakkySfera.js
//
// Unified parser for:
// - SNAKKY ISP, MAX (FBU / FOOD FBU / FOOD HE / SEL)
// - SFERA FOOD ISP
//
// Returns { selections, bands, totals, failures, coins }
// Note: failures[] includes both "failures" and "errors" (photocell + motor), per your request.

function normalizeText(raw) {
  if (!raw) return "";
  let text = String(raw);

  // Normalize line breaks and remove carriage markers
  text = text.replace(/\r/g, "\n").replace(/\^M/g, "\n");

  // Strip common noise tokens that sometimes get injected as standalone lines
  text = text
    .split("\n")
    .filter(line => !/^\s*(\+{3,}|ATH|ATE0)\s*$/.test(line)) // lines like '+++', 'ATH', 'ATE0'
    .join("\n");

  return text;
}

function pushRow(arr, type, amount, description = "") {
  const n = parseInt(String(amount).replace(/[^\d-]/g, ""), 10);
  if (Number.isFinite(n)) arr.push({ type, amount: n, description });
}

/** -----------------------------
 *  SELECTIONS
 *  "SELEZIONE N. 11\nTotale = 389"
 *  "SELECTION N. 11\nTotal = 389"
 *  Sometimes "SELECTION N. 11 Cod."
 * ------------------------------*/
function parseSelections(text) {
  const rows = [];
  const re = /(SELEZIONE|SELECTION)\s+N\.\s*(\d+)[^\n]*\n\s*(?:Totale|Total)\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = re.exec(text))) {
    pushRow(rows, `selection_${m[2]}`, m[3]);
  }
  return rows;
}

/** -----------------------------
 *  BANDS
 *  - "Fascia 0\nTotale = 123" (IT)
 *  - "Band 0\nTotal = 123" (EN)
 *  - HE/SEL variants:
 *    "Cash\nTotal = N", "Lista 1/2/3\nTotal = N", "Test\nTotal = N"
 *  - Also "Selezioni gratuite" / "Free selections"
 * ------------------------------*/
function parseBands(text) {
  const rows = [];

  // Standard bandX lines
  let m;
  const reBand = /(Fascia|Band)\s+(\d+)[^\n]*\n\s*(?:Totale|Total)\s*=\s*([-\d]+)/gi;
  while ((m = reBand.exec(text))) {
    pushRow(rows, `band_${m[2]}`, m[3]);
  }

  // Cash / Lista n / Test
  const reCashListaTest = /(Cash|Lista\s*1|Lista\s*2|Lista\s*3|Test)[^\n]*\n\s*(?:Totale|Total)\s*=\s*([-\d]+)/gi;
  while ((m = reCashListaTest.exec(text))) {
    const label = m[1].toLowerCase().replace(/\s+/g, "_"); // "lista_1", "cash", "test"
    pushRow(rows, label, m[2]);
  }

  // Free selections (Italian/English)
  const freeIT = text.match(/Selezioni\s+gratuite[^\n]*\n\s*Totale\s*=\s*([-\d]+)/i);
  if (freeIT) pushRow(rows, "free", freeIT[1]);

  const freeEN = text.match(/Free\s+selections[^\n]*\n\s*Total\s*=\s*([-\d]+)/i);
  if (freeEN) pushRow(rows, "free", freeEN[1]);

  return rows;
}

/** -----------------------------
 *  TOTALS
 *  - "TOTALE\nTotale = N" OR "TOTAL\nTotal = N"        => total_selections
 *  - "TOTALE INCASSATO" OR "TOTAL CASH"                => total_cash
 *  - "TOTALE VENDUTO"  OR "TOTAL SOLD"                 => total_sold
 *  - "TOT.INC. x ACCR." / "TOTALE INCAS.x ACCR." OR
 *    "TOTAL BY CREDIT"                                  => total_credit
 * ------------------------------*/
function parseTotals(text) {
  const rows = [];

  // Overall TOTAL selections
  const totSelIT = text.match(/^\s*TOTALE\s*[\r\n]+(?:Totale)\s*=\s*([-\d]+)/i);
  if (totSelIT) pushRow(rows, "total_selections", totSelIT[1]);
  const totSelEN = text.match(/^\s*TOTAL\s*[\r\n]+(?:Total)\s*=\s*([-\d]+)/im);
  if (totSelEN) pushRow(rows, "total_selections", totSelEN[1]);

  // Money totals
  const cashIT = text.match(/TOTALE\s+INCASSATO[\s\S]*?(?:Totale)\s*=\s*([-\d]+)/i);
  if (cashIT) pushRow(rows, "total_cash", cashIT[1]);
  const cashEN = text.match(/TOTAL\s+CASH[\s\S]*?(?:Total)\s*=\s*([-\d]+)/i);
  if (cashEN) pushRow(rows, "total_cash", cashEN[1]);

  const soldIT = text.match(/TOTALE\s+VENDUTO[\s\S]*?(?:Totale)\s*=\s*([-\d]+)/i);
  if (soldIT) pushRow(rows, "total_sold", soldIT[1]);
  const soldEN = text.match(/TOTAL\s+SOLD[\s\S]*?(?:Total)\s*=\s*([-\d]+)/i);
  if (soldEN) pushRow(rows, "total_sold", soldEN[1]);

  const creditIT = text.match(/TOT(?:\.|)\s*(?:INC\.?\s*x\s*ACCR\.?|INCAS\.?x\s*ACCR\.)[\s\S]*?(?:Totale)\s*=\s*([-\d]+)/i);
  if (creditIT) pushRow(rows, "total_credit", creditIT[1]);
  const creditEN = text.match(/TOTAL\s+BY\s+CREDIT[\s\S]*?(?:Total)\s*=\s*([-\d]+)/i);
  if (creditEN) pushRow(rows, "total_credit", creditEN[1]);

  return rows;
}

/** -----------------------------
 *  FAILURES + ERRORS (combined)
 *  General failures (IT/EN), Photocell errors (3 counters), Motor errors per selection.
 * ------------------------------*/
function parseFailuresAndErrors(text) {
  const rows = [];

  // Helper: find label line followed by counter line
  function findLabelCounter(labelRegex, type) {
    const re = new RegExp(
      String(labelRegex.source) + // the label line
      "[^\\n]*\\n\\s*(?:Contat(?:ore)?\\.?|Counter)\\s*=\\s*([\\-\\d]+)",
      labelRegex.flags
    );
    const m = text.match(re);
    if (m) pushRow(rows, type, m[1]);
  }

  // General failures (Italian & English variants)
  findLabelCounter(/(?:Compressore|Compressor)/i, "failure_compressor");
  findLabelCounter(/(?:Sonda\s*Temperat\.?|Sensor)/i, "failure_sensor");
  findLabelCounter(/(?:Gettoniera|Coin\s+Mechanism)/i, "failure_coin_mech");
  findLabelCounter(/(?:Dati\s*RAM|Ram\s*Data)/i, "failure_ram");
  findLabelCounter(/(?:Blocco\s+Vano(?:\s+Prelievo|)|COMPARTMENT\s+LOCK)/i, "failure_lock");
  findLabelCounter(/(?:Temperatura\s+Sicurez\.|Safety\s+temperature)/i, "failure_safety_temp");

  // Photocell / Phot errors
  const photoMap = [
    { re: /(?:Errore\s+prima\s+erog\.\s*|Error\s+before\s+dispen\.)/i, type: "error_before_dispense" },
    { re: /(?:Errore\s+dopo\s+erog\.\s*|Error\s+after\s+dispens\.)/i, type: "error_after_dispense" },
    { re: /(?:Errore\s+no\s+prodotto|Error\s+no\s+product)/i, type: "error_no_product" }
  ];
  for (const { re, type } of photoMap) {
    const m = text.match(new RegExp(re.source + "[^\\n]*\\n\\s*(?:Contat(?:ore)?\\.?|Counter)\\s*=\\s*([\\-\\d]+)", "i"));
    if (m) pushRow(rows, type, m[1]);
  }

  // Motor errors per selection (IT/EN)
  const reMotor = /(SELEZIONE|SELECTION)\s+N\.\s*(\d+)[^\n]*\n\s*(?:Contat(?:ore)?\.?|Counter)\s*=?\s*([-\d]+)/gi;
  let m;
  while ((m = reMotor.exec(text))) {
    pushRow(rows, `motor_error_${m[2]}`, m[3]);
  }

  return rows;
}

/** -----------------------------
 *  COIN MECH
 *  - "Moneta N. 1\nTotale = N" (IT)
 *  - "Coin no. 1\nTotal = N" (EN)
 * ------------------------------*/
function parseCoins(text) {
  const rows = [];
  let m;

  const reIT = /Moneta\s+N\.\s*(\d+)[^\n]*\n\s*Totale\s*=\s*([-\d]+)/gi;
  while ((m = reIT.exec(text))) {
    pushRow(rows, `coin_${m[1]}`, m[2]);
  }

  const reEN = /Coin\s+no\.\s*(\d+)[^\n]*\n\s*Total\s*=\s*([-\d]+)/gi;
  while ((m = reEN.exec(text))) {
    pushRow(rows, `coin_${m[1]}`, m[2]);
  }

  return rows;
}

function parseSnakkySfera(rawText) {
  const text = normalizeText(rawText);

  const selections = parseSelections(text);
  const bands      = parseBands(text);
  const totals     = parseTotals(text);
  const failures   = parseFailuresAndErrors(text); // merged failures + errors
  const coins      = parseCoins(text);

  return { selections, bands, totals, failures, coins };
}

module.exports = parseSnakkySfera;
