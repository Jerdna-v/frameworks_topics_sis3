function parseBrio(text) {
  const selections = [];
  const prices = [];
  const coins = [];
  const totals = [];
  const failures = [];

  // Selections with Pag./Gra./Test
  const selRe = /Sel\.\s*(\d+)[\s\S]*?Pag\.\s*=\s*(\d+)\s*[\r\n]+.*?Gra\.\s*=\s*(\d+)\s*[\r\n]+.*?Test=\s*(\d+)/gi;
  let m;
  while ((m = selRe.exec(text))) {
    selections.push({ type: `selection_${m[1]}_pag`, amount: parseInt(m[2], 10), description: "" });
    selections.push({ type: `selection_${m[1]}_gra`, amount: parseInt(m[3], 10), description: "" });
    selections.push({ type: `selection_${m[1]}_test`, amount: parseInt(m[4], 10), description: "" });
  }

  // Prices
  const priceRe = /Prz\.\s*(\d+)\s*=\s*(\d+)/gi;
  while ((m = priceRe.exec(text))) {
    prices.push({ type: `price_${m[1]}`, amount: parseInt(m[2], 10), description: "" });
  }

  // Coins
  const coinRe = /Mon\.\s*(\d+)\s*=\s*(\d+)/gi;
  while ((m = coinRe.exec(text))) {
    coins.push({ type: `coin_${m[1]}`, amount: parseInt(m[2], 10), description: "" });
  }
  const jetton = text.match(/Jet\.\s*=\s*(\d+)/i);
  if (jetton) coins.push({ type: "jetton", amount: parseInt(jetton[1], 10), description: "" });

  // Totals
  const totCash = text.match(/TOT\. CASSA MON\.\s*=\s*([-\d]+)/i);
  if (totCash) totals.push({ type: "total_cash", amount: parseInt(totCash[1], 10), description: "" });
  const totCredit = text.match(/TOT\. ACCREDITI\s*=\s*([-\d]+)/i);
  if (totCredit) totals.push({ type: "total_credit", amount: parseInt(totCredit[1], 10), description: "" });

  // Failures
  const failRe = /Er\.\s*(\d+)\s*=\s*(\d+)/gi;
  while ((m = failRe.exec(text))) {
    failures.push({ type: `error_${m[1]}`, amount: parseInt(m[2],10), description: "" });
  }

  return { selections, prices, coins, totals, failures };
}

module.exports = parseBrio;
