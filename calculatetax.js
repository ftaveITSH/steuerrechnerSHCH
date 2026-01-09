// --- small helpers ---
const moneyFmt = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmtMoney(n) {
  const v = Number(n) || 0;
  return moneyFmt.format(v);
}

// rounds up to nearest 0.05 (because *20 /20)
function roundUpTo005(x) {
  return Math.ceil(Number(x) * 20) / 20;
}

function $(id) {
  return document.getElementById(id);
}

function setShown(el, shown) {
  if (el) el.hidden = !shown;
}

function setText(el, text) {
  if (el) el.innerText = text;
}

function setValue(el, value) {
  if (el) el.value = value;
}

function requireEls(ids) {
  const els = Object.fromEntries(ids.map(id => [id, $(id)]));
  const missing = Object.entries(els).filter(([, el]) => !el).map(([id]) => id);
  if (missing.length) {
    console.error("Missing DOM elements:", missing);
    return null;
  }
  return els;
}

// --- domain logic ---
function getGemeindeAndKanton(steuerjahr, gemeinde) {
  const yearData = dataGlobal?.[steuerjahr];
  if (!yearData) return { selectedGemeinde: null, selectedKanton: null };

  return {
    selectedGemeinde: yearData.find(item => item.Gemeinde === gemeinde) ?? null,
    selectedKanton: yearData.find(item => item.Gemeinde === "Kanton") ?? null,
  };
}

function calcShareTax(efftax, percent) {
  return roundUpTo005(efftax * (Number(percent) / 100));
}

function countKonfessionen(selectElements) {
  const values = Array.from(selectElements)
    .map(s => s.value)
    .filter(v => v !== "");

  const totalPeople = values.length;

  const counts = {
    roemK: values.filter(v => v === "roemK").length,
    christK: values.filter(v => v === "christK").length,
    evangR: values.filter(v => v === "evangR").length,
    Andere: values.filter(v => v === "Andere").length,
  };

  return { totalPeople, counts };
}

function calcChurchTax(efftax, gemeindeData, konfessionSelects) {
  const { totalPeople, counts } = countKonfessionen(konfessionSelects);

  if (totalPeople === 0) {
    return { total: 0, breakdownLabel: "Kirchensteuer:" };
  }

  // rate per konfession is from gemeindeData[code], distributed by number of people selected
  const taxParts = {
    roemK: (efftax * (Number(gemeindeData.roemK) / 100) / totalPeople) * counts.roemK,
    christK: (efftax * (Number(gemeindeData.christK) / 100) / totalPeople) * counts.christK,
    evangR: (efftax * (Number(gemeindeData.evangR) / 100) / totalPeople) * counts.evangR,
    Andere: 0,
  };

  const total = taxParts.roemK + taxParts.christK + taxParts.evangR + taxParts.Andere;

  const breakdown = [];
  if (counts.roemK) breakdown.push(`${counts.roemK}x Röm. Katholisch, ${gemeindeData.roemK}%`);
  if (counts.christK) breakdown.push(`${counts.christK}x Christl. Katholisch, ${gemeindeData.christK}%`);
  if (counts.evangR) breakdown.push(`${counts.evangR}x Evang. Reformiert, ${gemeindeData.evangR}%`);
  if (counts.Andere) breakdown.push(`${counts.Andere}x Andere, 0%`);

  return {
    total,
    breakdownLabel: `Kirchensteuer:\n ${breakdown.join(" / ")}`,
  };
}

// --- refactored showresults ---
function showresults(efftax) {
  const els = requireEls([
    "slsteuerjahr",
    "slgemeinde",
    "hrtrenner",
    "diveinfachesteuer",
    "txteinfachesteuer",
    "txtkantonssteuer",
    "lblkantonssteuer",
    "divkantonssteuer",
    "txtgemeindesteuer",
    "lblgemeindesteuer",
    "divgemeindesteuer",
    "txtkirchensteuer",
    "lblkirchensteuer",
    "divkirchensteuer",
    "divkonfessionen",
    "divtotalsteuer",
    "txtefftax",
  ]);
  if (!els) return;

  const eff = Number(efftax);
  const steuerjahr = els.slsteuerjahr.value;
  const gemeinde = els.slgemeinde.value;

  setShown(els.hrtrenner, true);

  // einfache Steuer always shown
  setShown(els.diveinfachesteuer, true);
  setValue(els.txteinfachesteuer, fmtMoney(eff));

  // load data
  const { selectedGemeinde, selectedKanton } = getGemeindeAndKanton(steuerjahr, gemeinde);
  if (!selectedGemeinde || !selectedKanton) {
    console.error("Selected gemeinde or kanton data not found.", { steuerjahr, gemeinde });
    return;
  }

  // labels (static part)
  setText(els.lblkantonssteuer, "Anteil Kantonssteuer");
  setText(els.lblgemeindesteuer, "Anteil Gemeindesteuer");

  // compute shares
  const kantonssteuer = calcShareTax(eff, selectedKanton.natPers);
  const gemeindesteuer = calcShareTax(eff, selectedGemeinde.natPers);

  // write shares
  setValue(els.txtkantonssteuer, fmtMoney(kantonssteuer));
  setText(els.lblkantonssteuer, `Anteil Kantonssteuer (${selectedKanton.natPers}%)`);
  setShown(els.divkantonssteuer, true);

  setValue(els.txtgemeindesteuer, fmtMoney(gemeindesteuer));
  setText(els.lblgemeindesteuer, `Anteil Gemeindesteuer (${selectedGemeinde.natPers}%)`);
  setShown(els.divgemeindesteuer, true);

  // church tax
  const konfessionSelects = els.divkonfessionen.getElementsByTagName("select");
  const church = calcChurchTax(eff, selectedGemeinde, konfessionSelects);

  setText(els.lblkirchensteuer, church.breakdownLabel);

  if (church.total > 0) {
    setValue(els.txtkirchensteuer, fmtMoney(church.total));
    setShown(els.divkirchensteuer, true);
  } else {
    setValue(els.txtkirchensteuer, fmtMoney(0));
    setShown(els.divkirchensteuer, false);
  }

  // total
  const totalTax = Number(kantonssteuer) + Number(gemeindesteuer) + Number(church.total);
  setValue(els.txtefftax, fmtMoney(totalTax));
  setShown(els.divtotalsteuer, true);
}


function calculatetax(amount, totalmonate) {

    // amount in temp variable schreiben, später für lbleinfachesteuer verwendet (% ausrechnen mit original steuer wert)
    let originalamount = amount;

    // nullen von bisherigem tax & setzen von besitzdauerJahren
    let tax = 0;
    let ownershipYears = Math.floor(totalmonate / 12);

    lbleinfachesteuer = document.getElementById('lbleinfachesteuer')
    lbleinfachesteuer.innerText = "Einfache Steuer"

    // definieren von Steuerraten
    const ranges = [
        { limit: 2000, rate: 0.02 },
        { limit: 4000, rate: 0.04 },
        { limit: 6000, rate: 0.06 },
        { limit: 8000, rate: 0.08 },
        { limit: 15000, rate: 0.10 },
        { limit: 30000, rate: 0.12 },
        { limit: 45000, rate: 0.14 },
        { limit: 60000, rate: 0.16 },
        { limit: 80000, rate: 0.18 },
        { limit: 100000, rate: 0.20 }
    ];

    // definieren von zusatzgebühren (Abhängig von besitzdauer in monaten)
    const surcharges = [
        { maxMonths: 6, rate: 0.50 },
        { maxMonths: 12, rate: 0.45 },
        { maxMonths: 18, rate: 0.40 },
        { maxMonths: 24, rate: 0.35 },
        { maxMonths: 30, rate: 0.30 },
        { maxMonths: 36, rate: 0.25 },
        { maxMonths: 42, rate: 0.20 },
        { maxMonths: 48, rate: 0.15 },
        { maxMonths: 54, rate: 0.10 },
        { maxMonths: 60, rate: 0.05 }
    ];

    // rabatte abhängig von besitzdauerJahre
    const discounts = [
        { years: 6, rate: 0.05 },
        { years: 7, rate: 0.10 },
        { years: 8, rate: 0.15 },
        { years: 9, rate: 0.20 },
        { years: 10, rate: 0.25 },
        { years: 11, rate: 0.30 },
        { years: 12, rate: 0.35 },
        { years: 13, rate: 0.40 },
        { years: 14, rate: 0.45 },
        { years: 15, rate: 0.50 },
        { years: 16, rate: 0.55 },
        { years: 17, rate: 0.60 }
    ];

    // Steuer ausrechnen anhand gegebenen Tarifen
    for (let i = 0; i < ranges.length; i++) {

        if (amount <= 0) break;

        const { limit, rate } = ranges[i];
        const previousLimit = i > 0 ? ranges[i - 1].limit : 0;
        const taxableAmount = Math.min(amount, limit - previousLimit);

        // Alle Raten "Abarbeiten" bis mit allen Tarifen durch
        tax += taxableAmount * rate;
        amount -= taxableAmount;

        console.log(`Range ${i + 1}: Limit = ${limit}, Rate = ${rate}, Taxable Amount = ${taxableAmount}, Accumulated Tax = ${tax}`);
    }

    // Übriger Betrag (alles über den ersten 100'000 wird einheitlich mit 15% besteuert)
    if (amount > 0) {
        tax += amount * 0.15;
        console.log(`Remaining Amount: ${amount}, Additional Tax: ${amount * 0.15}`);
    }

    // Append tax percentage to label
    lbleinfachesteuer.innerText += ` 
    (${(100 / (originalamount) * tax).toFixed(4)}%)`

    if (totalmonate < 60) {
        for (let i = 0; i < surcharges.length; i++) {
            if (totalmonate <= surcharges[i].maxMonths) {

                lbleinfachesteuer.innerText += ` 
                (Zuschlag: ${(surcharges[i].rate * 100).toFixed(2)}%)`

                tax *= 1 + surcharges[i].rate;
                console.log(`Applied Surcharge: Rate = ${surcharges[i].rate}, Total Tax after Surcharge = ${tax}`);

                break;
            }
        }
    }

    if (ownershipYears >= 6) {
        for (let i = discounts.length - 1; i >= 0; i--) {
            if (ownershipYears >= discounts[i].years) {

                lbleinfachesteuer.innerText += `
                (Abschlag: ${(discounts[i].rate * 100).toFixed(2)}%)`

                tax *= 1 - discounts[i].rate;
                console.log(`Applied Discount: Rate = ${discounts[i].rate}, Total Tax after Discount = ${tax}`);

                break;
            }
        }
    }

    // return (Math.ceil(tax / 20) * 20).toFixed(2);
    return tax.toFixed(2)
}
