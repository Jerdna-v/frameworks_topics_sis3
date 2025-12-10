function parseTotalsColibri(text) {
  const rows = [];

  const counter = text.match(/Counter\s*=\s*([-\d]+)/i);
  if (counter) rows.push({ type: "total_count", amount: parseInt(counter[1],10), description: "" });

  const cupsNo = text.match(/Cups n\.o\.\s*=\s*([-\d]+)/i);
  if (cupsNo) rows.push({ type: "cups_no", amount: parseInt(cupsNo[1],10), description: "" });

  const cupsMain = text.match(/Cups main\.\s*=\s*([-\d]+)/i);
  if (cupsMain) rows.push({ type: "cups_main", amount: parseInt(cupsMain[1],10), description: "" });

  const coinTot = text.match(/COIN TOT\. CASH\s*=\s*([-\d]+)/i);
  if (coinTot) rows.push({ type: "coin_total_cash", amount: parseInt(coinTot[1],10), description: "" });

  const totCredit = text.match(/TOT\. CREDIT\s*=\s*([-\d]+)/i);
  if (totCredit) rows.push({ type: "total_credit", amount: parseInt(totCredit[1],10), description: "" });

  return rows;
}

module.exports = parseTotalsColibri;
