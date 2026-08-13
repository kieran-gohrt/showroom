/* PMAX ad copy generator — template/fragment based, no AI.
 * Character limits are enforced by measuring real output, not by asking
 * anything to "count carefully" — candidates that exceed the limit are
 * simply filtered out before selection, so nothing over-length can ever
 * reach the output.
 *
 * Offer type is free text (not a fixed dropdown) — real dealership
 * campaigns span far more than a handful of categories (EOFY Sale, Plate
 * Clearance, Run-Out, Stocktake, Christmas In July, Free Servicing, Bonus
 * Accessories...), so state.offers is an array of 1-2 { type, value }
 * pairs the user typed themselves, not a lookup against a fixed list.
 */

const PMAX_LIMITS = { headline: 30, longHeadline: 90, description: 90 };

const SCOPE_LABEL = {
  all: "",
  selected: "Selected Models",
  new: "New",
  demo: "Demo",
  newDemo: "New & Demo",
  used: "Used",
};

const SCOPE_PHRASE = {
  all: "our range",
  selected: "selected models",
  new: "new vehicles",
  demo: "demo vehicles",
  newDemo: "new and demo vehicles",
  used: "used vehicles",
};

const URGENCY_HEADLINE = {
  none: [],
  soft: ["Limited Time", "Now On", "Ends Soon", "While Stocks Last"],
  hard: ["Final Days", "Last Chance", "Closing Down", "Hurry, Ends Soon"],
};

const URGENCY_PHRASE = {
  none: [],
  soft: ["for a limited time", "while stocks last", "ends soon"],
  hard: ["for final days only", "before it closes down", "as a last chance"],
};

const FALLBACK_HEADLINES = [
  "In Stock Now",
  "Enquire Today",
  "Book A Test Drive",
  "Visit Us Today",
  "Now In Stock",
];

const FALLBACK_LONG_HEADLINES = [
  "Explore the range and book your test drive today",
  "In stock now, ready for immediate delivery",
  "Enquire today to find out more",
  "Visit us today to take a closer look",
];

const FALLBACK_DESCRIPTIONS = [
  "Explore the range today and book your test drive.",
  "In stock now and ready for immediate delivery.",
  "Enquire today to find out more about this offer.",
  "Visit us today, our team is ready to help.",
];

function capFirst(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function cleanText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function pickWithinLimit(candidates, fallbackPool, limit, count) {
  const seen = new Set();
  const valid = [];
  [...candidates, ...fallbackPool].forEach((raw) => {
    const clean = cleanText(raw);
    if (!clean || clean.length > limit) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    valid.push(clean);
  });
  for (let i = valid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [valid[i], valid[j]] = [valid[j], valid[i]];
  }
  return valid.slice(0, count);
}

function buildHeadlines(s) {
  const scope = SCOPE_LABEL[s.scope];
  const model = s.models[0] || "";
  const c = [];

  s.offers.forEach((o) => {
    if (o.value && o.type) c.push(`${o.value} ${o.type}`);
    if (o.value && model) c.push(`${model} ${o.value} Off`);
    if (model && o.type) c.push(`${model} ${o.type}`);
    if (scope && o.type) c.push(`${scope} ${o.type}`);
    if (o.value && scope) c.push(`${o.value} On ${scope}`);
    if (s.driveAway && o.value) c.push(`Drive Away ${o.value}`);
    if (s.dealer && o.type) c.push(`${s.dealer} ${o.type}`);
    if (o.value) c.push(`Save ${o.value} Today`);
    if (o.type) c.push(`${o.type} Event`);
    if (o.type) c.push(`${o.type} Now On`);
  });

  if (model) c.push(`${model} In Stock Now`);
  if (model && scope) c.push(`${scope} ${model} Now`);
  if (s.endDate) c.push(`Ends ${s.endDate}`);
  if (model) c.push(`${model} Special Offer`);
  if (s.dealer) c.push(`${s.dealer} Event`);
  if (s.dealer && scope) c.push(`${scope} At ${s.dealer}`);
  URGENCY_HEADLINE[s.urgency].forEach((u) => c.push(u));

  return pickWithinLimit(c, FALLBACK_HEADLINES, PMAX_LIMITS.headline, 5);
}

function buildLongHeadlines(s) {
  const scopeLower = SCOPE_PHRASE[s.scope];
  const scope = SCOPE_LABEL[s.scope];
  const model = s.models[0] || "";
  const urgencies = URGENCY_PHRASE[s.urgency];
  const c = [];

  s.offers.forEach((o) => {
    if (o.value && o.type) c.push(capFirst(`${o.value} ${o.type} at ${s.dealer}`));
    if (o.value && o.type) c.push(capFirst(`${o.value} ${o.type} on ${scopeLower} at ${s.dealer}`));
    if (o.value && o.type) c.push(capFirst(`Drive away today with ${o.value} ${o.type} at ${s.dealer}`));
    if (o.value && o.type && s.endDate) c.push(capFirst(`${o.value} ${o.type} ends ${s.endDate} at ${s.dealer}`));
    if (model && o.value && o.type) c.push(capFirst(`${model} ${o.type}, ${o.value} at ${s.dealer}`));
    urgencies.forEach((u) => {
      if (o.value && o.type) c.push(capFirst(`${o.value} ${o.type} at ${s.dealer}, ${u}`));
    });
  });

  if (s.offers.length === 2) {
    const [a, b] = s.offers;
    if (a.value && a.type && b.value && b.type) {
      c.push(capFirst(`${a.value} ${a.type} or ${b.value} ${b.type} at ${s.dealer}`));
      c.push(capFirst(`Choose ${a.value} ${a.type} or ${b.value} ${b.type} at ${s.dealer}`));
    } else if (a.type && b.type) {
      c.push(capFirst(`Choose ${a.type} or ${b.type} at ${s.dealer} today`));
    }
  }

  const leadOffer = s.offers.find((o) => o.value && o.type);
  if (leadOffer) {
    c.push(capFirst(`Visit ${s.dealer} today for ${leadOffer.value} ${leadOffer.type} on ${scopeLower}`));
  } else {
    c.push(capFirst(`Visit ${s.dealer} today to explore ${scopeLower}`));
  }
  if (model) c.push(capFirst(`${scope} ${model} available now at ${s.dealer}`.replace(/^ /, "")));
  if (model) c.push(capFirst(`Explore the ${model} range at ${s.dealer} today`));
  c.push(capFirst(`Book a test drive at ${s.dealer} and save today`));

  return pickWithinLimit(c, FALLBACK_LONG_HEADLINES, PMAX_LIMITS.longHeadline, 5);
}

function buildDescriptions(s) {
  const scopeLower = SCOPE_PHRASE[s.scope];
  const scope = SCOPE_LABEL[s.scope];
  const model = s.models[0] || "";
  const urgencies = URGENCY_PHRASE[s.urgency];
  const tcsSuffix = s.tcsApply ? " T&Cs apply." : "";
  const c = [];

  s.offers.forEach((o) => {
    if (o.value) c.push(capFirst(`Save ${o.value} on ${scopeLower} at ${s.dealer}.`));
    if (model && o.value && o.type) c.push(capFirst(`Explore the ${model} with ${o.value} ${o.type} at ${s.dealer}.`));
    urgencies.forEach((u) => {
      if (o.value && o.type) c.push(capFirst(`${o.value} ${o.type} on ${scopeLower}, ${u}.`));
    });
  });

  if (s.offers.length === 2) {
    const [a, b] = s.offers;
    if (a.value && a.type && b.value && b.type) {
      c.push(capFirst(`Choose ${a.value} ${a.type} or ${b.value} ${b.type} at ${s.dealer}.`));
    } else if (a.type && b.type) {
      c.push(capFirst(`Choose ${a.type} or ${b.type} at ${s.dealer} today.`));
    }
  }

  c.push(capFirst(`Visit ${s.dealer} today and enquire about ${scopeLower}.`));
  if (scope) c.push(capFirst(`${scope} available now at ${s.dealer}. Enquire today.`));
  if (model) c.push(capFirst(`Drive away today in a ${model} at ${s.dealer}.`));
  c.push(capFirst(`Book your test drive at ${s.dealer} before this offer ends.`));
  if (s.endDate) c.push(capFirst(`Offer ends ${s.endDate}. Enquire at ${s.dealer} today.`));

  const withTcs = c.map((line) => {
    const trimmed = line.replace(/\.$/, ".");
    const withSuffix = trimmed + tcsSuffix;
    return withSuffix.length <= PMAX_LIMITS.description ? withSuffix : trimmed;
  });

  const fallbackWithTcs = FALLBACK_DESCRIPTIONS.map((line) => {
    const withSuffix = line + tcsSuffix;
    return withSuffix.length <= PMAX_LIMITS.description ? withSuffix : line;
  });

  return pickWithinLimit(withTcs, fallbackWithTcs, PMAX_LIMITS.description, 5);
}

function generatePmaxCopy(state) {
  return {
    headlines: buildHeadlines(state),
    longHeadlines: buildLongHeadlines(state),
    descriptions: buildDescriptions(state),
  };
}

function formatPmaxOutput(result) {
  const numbered = (list) => list.map((line, i) => `${i + 1}. ${line}`).join("\n");
  return [
    "Headlines\n" + numbered(result.headlines),
    "Long headlines\n" + numbered(result.longHeadlines),
    "Descriptions\n" + numbered(result.descriptions),
  ].join("\n\n");
}
