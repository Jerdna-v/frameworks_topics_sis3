function parseKikko(text) {
  const selections = [];
  const bands = [];
  const totals = [];
  const failures = [];
  const coins = [];

  // Clean ^M into \n
  text = text.replace(/\^M/g, "\n");

  // Totals
  const totCount = text.match(/TOTAL\s+COUNT\s+0*([-\d]+)/i);
  if (totCount) totals.push({ type: "total_count", amount: parseInt(totCount[1],10), description: "" });

  const selNorm = text.match(/Compl\. sel\.N\.op\.\s*Total\s*=\s*([-\d]+)/i);
  if (selNorm) totals.push({ type: "full_sel_norm", amount: parseInt(selNorm[1],10), description: "" });

  const selMaint = text.match(/Compl\. sel\.maint\s*Total\s*=\s*([-\d]+)/i);
  if (selMaint) totals.push({ type: "full_sel_maint", amount: parseInt(selMaint[1],10), description: "" });

  // Selections
  const selRe = /SELECTION\s+N\.\s*(\d+)[^\n]*\nTotal\s*=\s*([-\d]+)/gi;
  let m;
  while ((m = selRe.exec(text))) {
    selections.push({ type: `selection_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }

  // Bands
  const bandRe = /Band\s+(\d+)[^\n]*\nTotal\s*=\s*([-\d]+)/gi;
  while ((m = bandRe.exec(text))) {
    bands.push({ type: `band_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }

  const free = text.match(/Free[^\n]*\nTotal\s*=\s*([-\d]+)/i);
  if (free) bands.push({ type: "free", amount: parseInt(free[1],10), description: "" });

  const test = text.match(/Test[^\n]*\nTotal\s*=\s*([-\d]+)/i);
  if (test) bands.push({ type: "test", amount: parseInt(test[1],10), description: "" });

  const discount = text.match(/DISCOUNT[^\n]*\nTot\.\s*=\s*([-\d]+)/i);
  if (discount) bands.push({ type: "discount", amount: parseInt(discount[1],10), description: "" });

  const over = text.match(/OVER-PRICE[^\n]*\nTot\.\s*=\s*([-\d]+)/i);
  if (over) bands.push({ type: "over_price", amount: parseInt(over[1],10), description: "" });

  // Failures
  const failRe = /\s*([A-Z ]+?)\s*Counter\s*([-\d]+)/gi;
  while ((m = failRe.exec(text))) {
    failures.push({ type: m[1].trim().replace(/\s+/g, "_").toLowerCase(), amount: parseInt(m[2],10), description: "" });
  }

  // Coins
  const coinRe = /Coin\s+N\.\s*(\d+)[^\n]*\nTotal\s*=\s*([-\d]+)/gi;
  while ((m = coinRe.exec(text))) {
    coins.push({ type: `coin_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }

  const totalCashed = text.match(/TOTAL\s+CASHED[^\n]*\nTot\.\s*=\s*([-\d]+)/i);
  if (totalCashed) coins.push({ type: "total_cashed", amount: parseInt(totalCashed[1],10), description: "" });

  const totalSold = text.match(/TOTAL\s+SOLD[^\n]*\nTot\.\s*=\s*([-\d]+)/i);
  if (totalSold) coins.push({ type: "total_sold", amount: parseInt(totalSold[1],10), description: "" });

  const totalCashCred = text.match(/TOTAL\s+CASH\s+CRED\.[^\n]*\nTot\.\s*=\s*([-\d]+)/i);
  if (totalCashCred) coins.push({ type: "total_cash_credit", amount: parseInt(totalCashCred[1],10), description: "" });

  return { selections, bands, totals, failures, coins };
}

module.exports = parseKikko;
