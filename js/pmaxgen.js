/* PMAX ad copy generator — template/fragment based, no AI.
 * Character limits are enforced by measuring real output, not by asking
 * anything to "count carefully" — candidates that exceed the limit are
 * simply filtered out before selection, so nothing over-length can ever
 * reach the output.
 */

const PMAX_LIMITS = { headline: 30, longHeadline: 90, description: 90 };

const OFFER_TYPE_NOUN = {
  cashback: "Cashback",
  finance: "Finance",
  clearance: "Clearance",
  bonus: "Bonus Offer",
  general: "",
};

const OFFER_TYPE_PHRASE = {
  cashback: "cashback offer",
  finance: "finance rate",
  clearance: "clearance event",
  bonus: "bonus offer",
  general: "offer",
};

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
  const noun = OFFER_TYPE_NOUN[s.offerType];
  const scope = SCOPE_LABEL[s.scope];
  const model = s.models[0] || "";
  const c = [];

  if (s.offerValue && noun) c.push(`${s.offerValue} ${noun}`);
  if (s.offerValue && model) c.push(`${model} ${s.offerValue} Off`);
  if (model && noun) c.push(`${model} ${noun}`);
  if (scope && noun) c.push(`${scope} ${noun}`);
  if (s.offerValue && scope) c.push(`${s.offerValue} On ${scope}`);
  if (s.driveAway && s.offerValue) c.push(`Drive Away ${s.offerValue}`);
  if (s.dealer && noun) c.push(`${s.dealer} ${noun}`);
  if (model) c.push(`${model} In Stock Now`);
  if (model && scope) c.push(`${scope} ${model} Now`);
  if (s.endDate) c.push(`Ends ${s.endDate}`);
  if (s.offerValue) c.push(`Save ${s.offerValue} Today`);
  if (noun) c.push(`${noun} Event`);
  if (model) c.push(`${model} Special Offer`);
  if (s.dealer) c.push(`${s.dealer} Event`);
  if (s.dealer && scope) c.push(`${scope} At ${s.dealer}`);
  URGENCY_HEADLINE[s.urgency].forEach((u) => c.push(u));

  return pickWithinLimit(c, FALLBACK_HEADLINES, PMAX_LIMITS.headline, 5);
}

function buildLongHeadlines(s) {
  const noun = OFFER_TYPE_PHRASE[s.offerType];
  const scopeLower = SCOPE_PHRASE[s.scope];
  const scope = SCOPE_LABEL[s.scope];
  const model = s.models[0] || "";
  const urgencies = URGENCY_PHRASE[s.urgency];
  const c = [];

  if (s.offerValue) c.push(capFirst(`${s.offerValue} ${noun} at ${s.dealer}`));
  if (s.offerValue) c.push(capFirst(`${s.offerValue} ${noun} on ${scopeLower} at ${s.dealer}`));
  if (model) c.push(capFirst(`${scope} ${model} available now at ${s.dealer}`.replace(/^ /, "")));
  if (s.offerValue) c.push(capFirst(`Drive away today with ${s.offerValue} ${noun} at ${s.dealer}`));
  if (s.offerValue) {
    c.push(capFirst(`Visit ${s.dealer} today for ${s.offerValue} ${noun} on ${scopeLower}`));
  } else {
    c.push(capFirst(`Visit ${s.dealer} today to explore ${scopeLower}`));
  }
  if (model) c.push(capFirst(`Explore the ${model} range at ${s.dealer} today`));
  c.push(capFirst(`Book a test drive at ${s.dealer} and save today`));
  if (s.endDate && s.offerValue) c.push(capFirst(`${s.offerValue} ${noun} ends ${s.endDate} at ${s.dealer}`));
  urgencies.forEach((u) => {
    if (s.offerValue) c.push(capFirst(`${s.offerValue} ${noun} at ${s.dealer}, ${u}`));
  });
  if (model && s.offerValue) c.push(capFirst(`${model} ${noun}, ${s.offerValue} at ${s.dealer}`));

  return pickWithinLimit(c, FALLBACK_LONG_HEADLINES, PMAX_LIMITS.longHeadline, 5);
}

function buildDescriptions(s) {
  const noun = OFFER_TYPE_PHRASE[s.offerType];
  const scopeLower = SCOPE_PHRASE[s.scope];
  const scope = SCOPE_LABEL[s.scope];
  const model = s.models[0] || "";
  const urgencies = URGENCY_PHRASE[s.urgency];
  const tcsSuffix = s.tcsApply ? " T&Cs apply." : "";
  const c = [];

  if (s.offerValue) c.push(capFirst(`Save ${s.offerValue} on ${scopeLower} at ${s.dealer}.`));
  if (model && s.offerValue) c.push(capFirst(`Explore the ${model} with ${s.offerValue} ${noun} at ${s.dealer}.`));
  c.push(capFirst(`Visit ${s.dealer} today and enquire about ${scopeLower}.`));
  if (scope) c.push(capFirst(`${scope} available now at ${s.dealer}. Enquire today.`));
  if (model) c.push(capFirst(`Drive away today in a ${model} at ${s.dealer}.`));
  c.push(capFirst(`Book your test drive at ${s.dealer} before this offer ends.`));
  urgencies.forEach((u) => {
    if (s.offerValue) c.push(capFirst(`${s.offerValue} ${noun} on ${scopeLower}, ${u}.`));
  });
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
