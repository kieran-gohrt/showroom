/* PMAX ad copy generator — template/fragment based, no AI.
 * Character limits are enforced by measuring real output, not by asking
 * anything to "count carefully" — candidates that exceed the limit are
 * simply filtered out before selection, so nothing over-length can ever
 * reach the output.
 *
 * Patterns below are modelled directly off real approved PMAX sets (not
 * guessed), covering two distinct real campaign shapes:
 * 1. Value-led offers (a $ amount, %, or named bonus) - lead with the
 *    value and campaign name: "$2,000 Cashback On Tucson", "Get 3 years
 *    free servicing at Essendon Mazda".
 * 2. Model-focused browsing campaigns with no $ value - lead with the
 *    model and dealer using exploration verbs: "Essendon Omoda 9",
 *    "Explore the Omoda 9 range available now at Essendon Omoda Jaecoo",
 *    "View current Omoda 9 stock", "Test drive the Omoda 9 range today".
 *
 * Every line should carry real information (dealer, model, value, scope)
 * - generic dealer-less filler is a last resort only, used purely to fill
 * a slot when there genuinely aren't enough real candidates, never
 * competing equally with them. Selection is also biased toward longer
 * candidates so copy uses the available character budget, matching real
 * approved sets which run close to the limit rather than well under it.
 *
 * Offer type is free text (not a fixed dropdown) - real dealership
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

// Only ever appended to a real offer-bearing string, never used bare.
const URGENCY_SUFFIX_HEADLINE = {
  none: [],
  soft: ["Now On", "Ends Soon", "While Stocks Last"],
  hard: ["Final Days", "Last Chance", "Ends Soon"],
};

const URGENCY_PHRASE = {
  none: [],
  soft: ["for a limited time", "while stocks last", "ends soon"],
  hard: ["for final days only", "before it closes down", "as a last chance"],
};

// Rotated in front of long headlines/descriptions to match real approved
// copy, which leads with a varied action verb rather than the same
// sentence shape every time.
const ACTION_VERBS = ["Explore", "Discover", "Shop", "Get", "Secure", "Unlock", "Find", "Save", "View"];

// Last-resort only - used to fill a slot when there aren't enough
// offer-specific candidates, never picked over a real one. Kept large
// enough (6+) that a near-empty form still fills all 5 slots without
// ever repeating.
const FALLBACK_HEADLINES = [
  "Enquire Today",
  "Book A Test Drive",
  "Visit Us Today",
  "In Stock Now",
  "Explore The Range",
  "Speak To Our Team",
  "See What's In Stock",
];

const FALLBACK_LONG_HEADLINES = [
  "Explore the range and book your test drive today",
  "Enquire today to find out more about this offer",
  "Visit us today to take a closer look at the range",
  "In stock now and ready for immediate delivery",
  "Speak to our team to find out what's available",
  "Book a test drive and see the range for yourself",
];

const FALLBACK_DESCRIPTIONS = [
  "Explore the range today and book your test drive.",
  "Enquire today to find out more about this offer.",
  "Visit us today, our team is ready to help you out.",
  "In stock now and ready for immediate delivery.",
  "Speak to our team to find out what's available.",
  "Book a test drive and see the range for yourself.",
];

function capFirst(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function article(word) {
  return /^[aeiou]/i.test(word || "") ? "an" : "a";
}

function cleanText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function dedupeWithinLimit(list, limit) {
  const seen = new Set();
  const out = [];
  list.forEach((raw) => {
    const clean = cleanText(raw);
    if (!clean || clean.length > limit) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(clean);
  });
  return out;
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickVerb() {
  return ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
}

// Primary (offer-specific) candidates are always preferred over fallback
// filler, and within whichever pool is used, longer candidates (closer to
// the character limit) are preferred so copy uses the available space.
function pickBest(candidates, fallbackPool, limit, count) {
  const primary = shuffle(dedupeWithinLimit(candidates, limit)).sort((a, b) => b.length - a.length);
  let result = primary.slice(0, count);
  if (result.length < count) {
    const used = new Set(result.map((r) => r.toLowerCase()));
    const fallback = shuffle(dedupeWithinLimit(fallbackPool, limit))
      .sort((a, b) => b.length - a.length)
      .filter((f) => !used.has(f.toLowerCase()));
    result = result.concat(fallback.slice(0, count - result.length));
  }
  return result;
}

// Same idea as pickBest, but candidates carry a `shape` tag (the sentence
// structure/word-order they use). Real approved sets never repeat the same
// skeleton five times with just the tail swapped, so this picks at most one
// candidate per shape first - only repeating a shape if there genuinely
// aren't enough distinct ones to fill the slot.
function pickDiverse(tagged, fallbackPool, limit, count) {
  const seen = new Set();
  const pool = [];
  tagged.forEach(({ text, shape }) => {
    const clean = cleanText(text);
    if (!clean || clean.length > limit) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    pool.push({ text: clean, shape: shape || clean });
  });

  const byLength = shuffle(pool).sort((a, b) => b.text.length - a.text.length);
  const result = [];
  const usedShapes = new Set();

  byLength.forEach((item) => {
    if (result.length >= count || usedShapes.has(item.shape)) return;
    usedShapes.add(item.shape);
    result.push(item.text);
  });

  if (result.length < count) {
    const used = new Set(result.map((r) => r.toLowerCase()));
    byLength.forEach((item) => {
      if (result.length >= count || used.has(item.text.toLowerCase())) return;
      used.add(item.text.toLowerCase());
      result.push(item.text);
    });
  }

  if (result.length < count) {
    const used = new Set(result.map((r) => r.toLowerCase()));
    const fallback = shuffle(dedupeWithinLimit(fallbackPool, limit))
      .sort((a, b) => b.length - a.length)
      .filter((f) => !used.has(f.toLowerCase()));
    result.push(...fallback.slice(0, count - result.length));
  }

  return result;
}

function buildHeadlines(s) {
  const scope = SCOPE_LABEL[s.scope];
  const models = s.models.length ? s.models : [""];
  const urgencySuffixes = URGENCY_SUFFIX_HEADLINE[s.urgency];
  const c = [];

  s.offers.forEach((o) => {
    models.forEach((model) => {
      if (model && o.value && o.type) {
        c.push(`${model} ${o.value} ${o.type}`);
        c.push(`${o.value} ${o.type} On ${model}`);
        c.push(`Save ${o.value} On ${model}`);
      } else if (model && o.type) {
        // Model-focused, no $ value - exploration-led per real usage.
        c.push(`${s.dealer} ${model}`);
        c.push(`Drive The ${model} Today`);
        c.push(`${model} In Stock Now`);
        c.push(`Explore The ${model}`);
        c.push(`Explore The New ${model}`);
        c.push(`${model} Available Now`);
        c.push(`${model} At ${s.dealer}`);
      } else if (model && o.value) {
        c.push(`${model} ${o.value} Off`);
      }
      if (model && s.driveAway && o.value) c.push(`${model} Drive Away ${o.value}`);
    });

    if (o.value && o.type) {
      if (s.dealer) c.push(`${s.dealer} ${o.type}`);
      if (scope) c.push(`${o.value} ${o.type} On ${scope}`);
      c.push(`Save ${o.value} With ${o.type}`);
      if (s.dealer) c.push(`${o.value} ${o.type} At ${s.dealer}`);
      if (s.driveAway) c.push(`Drive Away ${o.value} ${o.type}`);
      urgencySuffixes.forEach((u) => c.push(`${o.value} ${o.type} ${u}`));
      // Value-only fallback: when the offer name itself is too long to fit
      // alongside the $ value in 30 characters, keep the number (the part
      // that actually matters) rather than dropping the offer entirely.
      c.push(`Save ${o.value} Today`);
      if (s.dealer) c.push(`${o.value} At ${s.dealer}`);
      if (scope) c.push(`${o.value} Off ${scope}`);
    } else if (o.type) {
      if (s.dealer) c.push(`${s.dealer} ${o.type}`);
      c.push(`${o.type} Offers On Now`);
      c.push(`${o.type} Offers Now`);
      if (scope) c.push(`${scope} ${o.type} Now On`);
      if (s.dealer) c.push(`${o.type} At ${s.dealer}`);
      urgencySuffixes.forEach((u) => c.push(`${o.type} ${u}`));
    }
  });

  if (s.endDate) c.push(`Offer Ends ${s.endDate}`);
  if (s.dealer && scope) c.push(`${scope} Range At ${s.dealer}`);
  if (models[0] && s.endDate) c.push(`${models[0]} Offer Ends ${s.endDate}`);

  return pickBest(c, FALLBACK_HEADLINES, PMAX_LIMITS.headline, 5);
}

function buildLongHeadlines(s) {
  const scopeLower = SCOPE_PHRASE[s.scope];
  const scope = SCOPE_LABEL[s.scope];
  const models = s.models.length ? s.models : [""];
  const realModels = s.models;
  const urgencies = URGENCY_PHRASE[s.urgency];
  const hasValueOffer = s.offers.some((o) => o.value && o.type);
  const leadOffer = s.offers.find((o) => o.value && o.type);
  const c = [];
  const push = (shape, text) => c.push({ shape, text: capFirst(text) });

  s.offers.forEach((o) => {
    models.forEach((model) => {
      if (model && o.value && o.type) {
        // Distinct word orders - value-led, model-led, and comma-broken -
        // so the five lines don't all share the same skeleton.
        push("value-lead-model", `${o.value} ${o.type} on the ${model} at ${s.dealer}`);
        push("model-lead-value", `The ${model} now comes with ${o.value} ${o.type} at ${s.dealer}`);
        push("model-buyers", `${model} buyers save ${o.value} with ${o.type} at ${s.dealer}`);
        push("model-comma-value", `${model} in stock now, with ${o.value} ${o.type} at ${s.dealer}`);
        push("verb-lead-model", `${pickVerb()} the ${model} today with ${o.value} ${o.type} at ${s.dealer}`);
        urgencies.forEach((u) => push("value-lead-model-urgency", `${o.value} ${o.type} on the ${model} at ${s.dealer}, ${u}`));
        push("value-lead-model-exclaim", `${o.value} ${o.type} on the ${model} at ${s.dealer}!`);
      } else if (model && o.type) {
        // Model-focused, no $ value.
        push("model-explore", `Explore the ${model} range available now at ${s.dealer}`);
        push("model-discover", `Discover the ${model} at ${s.dealer} today`);
        push("model-view-stock", `View current ${model} stock now at ${s.dealer}`);
        push("model-test-drive", `Test drive the ${model} range today at ${s.dealer}`);
        push("model-find", `Find your next vehicle with the ${model} at ${s.dealer}`);
      }
    });

    if (o.value && o.type) {
      // Scope leading (before the value) and dealer-possessive framing give
      // genuinely different sentence shapes, not just a swapped tail.
      push("value-lead-scope", `${o.value} ${o.type} on ${scopeLower} at ${s.dealer}`);
      push("scope-lead", `${capFirst(scopeLower)} at ${s.dealer} now come with ${o.value} ${o.type}`);
      push("dealer-possessive", `${s.dealer}'s ${scopeLower} now include ${o.value} ${o.type}`);
      push("verb-lead-scope", `${pickVerb()} ${o.value} ${o.type} at ${s.dealer} today`);
      if (s.endDate) {
        // Deadline-led shape, deliberately separate from the offer+model
        // lines above so the two together cover offer/model AND price/date
        // without any single line trying to cram in everything.
        push("deadline-lead", `This offer ends ${s.endDate}, with ${o.value} ${o.type} at ${s.dealer}`);
        push("deadline-lead-scope", `${o.value} ${o.type} on ${scopeLower} ends ${s.endDate} at ${s.dealer}`);
      }
      urgencies.forEach((u) => push("value-lead-scope-urgency", `${o.value} ${o.type} on ${scopeLower} at ${s.dealer}, ${u}`));
      push("value-lead-scope-exclaim", `${o.value} ${o.type} on ${scopeLower} at ${s.dealer}!`);
    } else if (o.type && !models.some(Boolean)) {
      push("type-lead-scope", `${o.type} now on across ${scopeLower} at ${s.dealer}`);
      push("verb-lead-type", `${pickVerb()} ${o.type} on ${scopeLower} at ${s.dealer}`);
    }

    if (o.value && o.type && s.driveAway && models[0]) {
      push("driveaway-model", `Drive away today in ${article(models[0])} ${models[0]} with ${o.value} ${o.type} at ${s.dealer}`);
    }
  });

  if (s.offers.length === 2) {
    const [a, b] = s.offers;
    if (a.value && a.type && b.value && b.type) {
      push("choose-value", `Choose ${a.value} ${a.type} or ${b.value} ${b.type} at ${s.dealer}`);
      push("choose-value-scope", `${a.value} ${a.type} or ${b.value} ${b.type} on ${scopeLower} at ${s.dealer}`);
    } else if (a.type && b.type) {
      push("choose-type", `Choose ${a.type} or ${b.type} on ${scopeLower} at ${s.dealer}`);
    }
  }

  if (hasValueOffer && models[0]) {
    push("explore-model-value", `Explore the ${models[0]} with ${leadOffer.value} ${leadOffer.type} at ${s.dealer}`);
  }
  if (realModels.length > 1) {
    // Reliable two-model coverage line - this is the shape most likely to
    // carry both model names when a headline (30 chars) can't fit them.
    push("two-model-coverage", `${realModels[0]} and ${realModels[1]} both qualify for ${(leadOffer || {}).value || ""} ${(leadOffer || {}).type || "this offer"} at ${s.dealer}`.replace(/\s+/g, " "));
    push("two-model-explore", `${scope || "Explore the"} ${realModels.join(" and ")} range at ${s.dealer}`.replace(/^ /, ""));
  }
  push("book-test-drive", `Book a test drive on ${scopeLower} at ${s.dealer} today`);

  return pickDiverse(c, FALLBACK_LONG_HEADLINES, PMAX_LIMITS.longHeadline, 5);
}

function buildDescriptions(s) {
  const scopeLower = SCOPE_PHRASE[s.scope];
  const scope = SCOPE_LABEL[s.scope];
  const models = s.models.length ? s.models : [""];
  const realModels = s.models;
  const urgencies = URGENCY_PHRASE[s.urgency];
  const leadOffer = s.offers.find((o) => o.value && o.type);
  const tcsSuffix = s.tcsApply ? " T&C's apply." : "";
  const c = [];
  const push = (shape, text) => c.push({ shape, text: capFirst(text) });

  s.offers.forEach((o) => {
    models.forEach((model) => {
      if (model && o.value && o.type) {
        push("verb-lead-model", `${pickVerb()} ${o.value} on the ${model} at ${s.dealer} with ${o.type}.`);
        push("model-lead-value", `The ${model} now comes with ${o.value} ${o.type} at ${s.dealer}.`);
        push("model-comma-value", `${model} in stock now, with ${o.value} ${o.type} at ${s.dealer}.`);
        urgencies.forEach((u) => push("value-lead-model-urgency", `${o.value} ${o.type} on the ${model} at ${s.dealer}, ${u}.`));
        push("value-lead-model-exclaim", `${o.value} ${o.type} on the ${model} at ${s.dealer}!`);
      } else if (model && o.type) {
        // Model-focused, no $ value.
        push("model-explore", `Explore the ${model} range now at ${s.dealer}.`);
        push("model-view-stock", `View current ${model} stock today at ${s.dealer}.`);
        push("model-test-drive", `Book a test drive in the ${model} at ${s.dealer}.`);
        push("model-discover", `Discover the ${model} and drive away sooner.`);
        push("model-find", `Find your next vehicle with the ${model} today.`);
      }
    });

    if (o.value && o.type) {
      push("verb-lead-scope", `${pickVerb()} ${o.value} with ${o.type} on ${scopeLower} at ${s.dealer}.`);
      push("scope-lead", `${capFirst(scopeLower)} at ${s.dealer} now come with ${o.value} ${o.type}.`);
      push("dealer-possessive", `${s.dealer}'s ${scopeLower} now include ${o.value} ${o.type}.`);
      if (s.endDate) {
        push("deadline-lead", `This offer ends ${s.endDate}, with ${o.value} ${o.type} at ${s.dealer}.`);
        push("deadline-lead-scope", `${o.value} ${o.type} on ${scopeLower} ends ${s.endDate} at ${s.dealer}.`);
      }
      urgencies.forEach((u) => push("value-lead-scope-urgency", `${o.value} ${o.type} on ${scopeLower} at ${s.dealer}, ${u}.`));
      push("value-lead-scope-exclaim", `${o.value} ${o.type} on ${scopeLower} at ${s.dealer}!`);
    } else if (o.type && !models.some(Boolean)) {
      push("type-lead-scope", `${o.type} now on across ${scopeLower} at ${s.dealer}. Enquire today.`);
    }

    if (o.value && o.type && s.driveAway && models[0]) {
      push("driveaway-model", `Drive away today in ${article(models[0])} ${models[0]} with ${o.value} ${o.type} at ${s.dealer}.`);
    }
  });

  if (s.offers.length === 2) {
    const [a, b] = s.offers;
    if (a.value && a.type && b.value && b.type) {
      push("choose-value", `Choose ${a.value} ${a.type} or ${b.value} ${b.type} on ${scopeLower} at ${s.dealer}.`);
    }
  }

  if (models[0]) push("driveaway-generic", `Drive away today in ${article(models[0])} ${models[0]} at ${s.dealer}. Enquire now.`);
  if (realModels.length > 1) {
    // Reliable two-model coverage - the shape most likely to carry both
    // model names when they don't both fit in a 30-char headline.
    push("two-model-coverage", `${realModels[0]} and ${realModels[1]} both qualify for ${(leadOffer || {}).value || "great offers"} ${(leadOffer || {}).type || ""} at ${s.dealer}.`.replace(/\s+/g, " "));
    push("two-model-explore", `Explore the ${realModels.join(" and ")} range at ${s.dealer} today.`);
  }
  push("book-test-drive", `Book your test drive on ${scopeLower} at ${s.dealer}, before this offer ends.`);
  if (s.endDate) push("deadline-generic", `This offer on ${scopeLower} ends ${s.endDate}. Enquire at ${s.dealer} today.`);

  const withTcs = c.map(({ shape, text }) => {
    const withSuffix = text + tcsSuffix;
    return { shape, text: withSuffix.length <= PMAX_LIMITS.description ? withSuffix : text };
  });

  const fallbackWithTcs = FALLBACK_DESCRIPTIONS.map((line) => {
    const withSuffix = line + tcsSuffix;
    return withSuffix.length <= PMAX_LIMITS.description ? withSuffix : line;
  });

  return pickDiverse(withTcs, fallbackWithTcs, PMAX_LIMITS.description, 5);
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
