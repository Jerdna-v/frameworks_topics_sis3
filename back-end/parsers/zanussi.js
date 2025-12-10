function parseZanussi(text, isBrio = false) {
  const selections = [];
  const prices = [];
  const coins = [];
  const totals = [];
  const failures = [];

  // Selections with Pag./Gra./Test or Payant/Gratuit/Test
  const selRe = /Sel\.\s*(\d+)[\s\S]*?(?:Pag\.|Payant)\s*=?\s*(\d+)\s*[\r\n]+.*?(?:Gra\.|Gratuit)\s*=?\s*(\d+)\s*[\r\n]+.*?(?:Test)\s*=?\s*(\d+)/gi;
  let m;
  while ((m = selRe.exec(text))) {
    selections.push({ type: `selection_${m[1]}_payant`, amount: parseInt(m[2], 10), description: "" });
    selections.push({ type: `selection_${m[1]}_gratuit`, amount: parseInt(m[3], 10), description: "" });
    selections.push({ type: `selection_${m[1]}_test`, amount: parseInt(m[4], 10), description: "" });
  }

  // Prices (Prz. or Prix)
  const priceRe = /(Prz\.|Prix)\s*(\d+)\s*=\s*(\d+)/gi;
  while ((m = priceRe.exec(text))) {
    prices.push({ type: `price_${m[2]}`, amount: parseInt(m[3], 10), description: "" });
  }

  // Coins (Mon. or Jet.)
  const coinRe = /Mon\.\s*(\d+)\s*=\s*(\d+)/gi;
  while ((m = coinRe.exec(text))) {
    coins.push({ type: `coin_${m[1]}`, amount: parseInt(m[2], 10), description: "" });
  }
  const getton = text.match(/Get\.\s*=\s*(\d+)/i);
  if (getton) coins.push({ type: "getton", amount: parseInt(getton[1],10), description: "" });
  const jeton = text.match(/Jet\.\s*=\s*(\d+)/i);
  if (jeton) coins.push({ type: "jeton", amount: parseInt(jeton[1],10), description: "" });

  // Skip totals + failures if it's BRIO
  if (!isBrio) {
    // Totals
    const totCash = text.match(/TOT\. CASSA MON\.|TOTAL CAISSE MONNAIE/i);
    if (totCash) {
      const val = text.match(/=\s*([-\d]+)/);
      if (val) totals.push({ type: "total_cash", amount: parseInt(val[1],10), description: "" });
    }
    const totCredit = text.match(/TOT\. ACCREDITI/i);
    if (totCredit) {
      const val = text.match(/=\s*([-\d]+)/);
      if (val) totals.push({ type: "total_credit", amount: parseInt(val[1],10), description: "" });
    }
    const totOver = text.match(/TOTAL SURPAIEMENT/i);
    if (totOver) {
      const val = text.match(/=\s*([-\d]+)/);
      if (val) totals.push({ type: "total_overpayment", amount: parseInt(val[1],10), description: "" });
    }

    // Failures
    const failRe = /Er\.\s*(\d+)\s*=\s*(\d+)/gi;
    while ((m = failRe.exec(text))) {
      failures.push({ type: `error_${m[1]}`, amount: parseInt(m[2],10), description: "" });
    }
  }

  return { selections, prices, coins, totals, failures };
}

module.exports = parseZanussi;
