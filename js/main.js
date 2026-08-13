/* Wizard wiring: reads the form, builds state, calls the generators, updates
 * the live preview iframe and the copyable code output. No build step. */

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
  });
});

// ---------- Dependent field show/hide (checkbox -> .dep-fields) ----------
document.querySelectorAll("[data-toggle]").forEach((cb) => {
  const target = document.getElementById(cb.dataset.toggle);
  const sync = () => { target.hidden = !cb.checked; };
  sync();
  cb.addEventListener("change", sync);
});

// ---------- Brand select (alphabetical) ----------
const brandSelect = document.getElementById("brandName");
[...BRAND_COLOURS]
  .sort((a, b) => a.name.localeCompare(b.name))
  .forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.name;
    opt.textContent = b.name;
    brandSelect.appendChild(opt);
  });
const customOpt = document.createElement("option");
customOpt.value = "";
customOpt.textContent = "Custom / other";
brandSelect.appendChild(customOpt);
brandSelect.value = "Mazda";

function applyBrandColours() {
  const b = findBrandColours(brandSelect.value);
  document.getElementById("colourPrimary").value = b.primary;
  scheduleUpdate();
}
brandSelect.addEventListener("change", applyBrandColours);

// ---------- Offers (dynamic add/remove, 0-6, added one at a time) ----------
const offersList = document.getElementById("offersList");
const addOfferBtn = document.getElementById("addOfferBtn");
const OFFER_MAX = 6;

function renumberOffers() {
  const rows = offersList.querySelectorAll(".offer-row");
  rows.forEach((row, i) => {
    row.querySelector(".offer-row-head span").textContent = `Offer ${i + 1}`;
  });
  addOfferBtn.disabled = rows.length >= OFFER_MAX;
}

function addOfferRow(title = "", desc = "") {
  const row = document.createElement("div");
  row.className = "offer-row";
  row.innerHTML = `
    <div class="offer-row-head">
      <span>Offer</span>
      <button type="button" class="remove-btn">Remove</button>
    </div>
    <label>Title <input type="text" class="offer-title" value="${title}" placeholder="e.g. Drive Away Pricing"></label>
    <label>Description <textarea class="offer-desc" placeholder="e.g. No hidden extras, just one straightforward price.">${desc}</textarea></label>
  `;
  offersList.appendChild(row);
  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    renumberOffers();
    scheduleUpdate();
  });
  wireLiveInputs(row);
  renumberOffers();
}
addOfferBtn.addEventListener("click", () => {
  if (offersList.querySelectorAll(".offer-row").length >= OFFER_MAX) return;
  addOfferRow();
  scheduleUpdate();
});

// ---------- Stock rows (dynamic add/remove, up to 10) ----------
const stockRowsWrap = document.getElementById("stockRows");
const addStockBtn = document.getElementById("addStockBtn");
const STOCK_MAX = 10;

function renumberStockRows() {
  const rows = stockRowsWrap.querySelectorAll(".stock-row");
  rows.forEach((row, i) => {
    row.querySelector(".stock-row-head span").textContent = `Slider ${i + 1}`;
    row.querySelector(".remove-btn").disabled = rows.length <= 1;
  });
  addStockBtn.disabled = rows.length >= STOCK_MAX;
}

let stockRowCounter = 0;

function buildStockRow() {
  stockRowCounter++;
  const groupName = `stock-mode-${stockRowCounter}`;
  const row = document.createElement("div");
  row.className = "stock-row";
  row.innerHTML = `
    <div class="stock-row-head field-row-head">
      <span>Slider</span>
      <button type="button" class="remove-btn">Remove</button>
    </div>
    <label>Section heading <input type="text" class="stock-heading" placeholder="e.g. New Arrivals"></label>
    <label>Intro text <input type="text" class="stock-intro" placeholder="e.g. Explore our latest new arrivals."></label>
    <label class="radio"><input type="radio" name="${groupName}" class="stock-mode" value="filter" checked> Filter by condition &amp; model</label>
    <label class="radio"><input type="radio" name="${groupName}" class="stock-mode" value="manual"> Manual stock numbers</label>
    <div class="stock-filter-fields">
        <label class="checkbox"><input type="checkbox" class="stock-cond" value="New" checked> New</label>
        <label class="checkbox"><input type="checkbox" class="stock-cond" value="Demo"> Demo</label>
        <label class="checkbox"><input type="checkbox" class="stock-cond" value="Used"> Used</label>
        <label>Models (comma-separated, matching the dealer site's exact model names) <input type="text" class="stock-models" placeholder="e.g. Tucson, Kona"></label>
    </div>
    <div class="stock-manual-fields" hidden>
        <label>Stock numbers (comma-separated) <input type="text" class="stock-numbers" placeholder="e.g. 31027237, 31421545, 31421614"></label>
    </div>
    <label>Card limit <input type="number" class="stock-limit" value="12" min="1" max="24"></label>
  `;
  stockRowsWrap.appendChild(row);
  row.querySelector(".remove-btn").addEventListener("click", () => {
    if (stockRowsWrap.querySelectorAll(".stock-row").length <= 1) return;
    row.remove();
    renumberStockRows();
    scheduleUpdate();
  });
  const filterFields = row.querySelector(".stock-filter-fields");
  const manualFields = row.querySelector(".stock-manual-fields");
  row.querySelectorAll(".stock-mode").forEach((radio) => {
    radio.addEventListener("change", () => {
      const isManual = row.querySelector(".stock-mode:checked").value === "manual";
      filterFields.hidden = isManual;
      manualFields.hidden = !isManual;
      scheduleUpdate();
    });
  });
  wireLiveInputs(row);
  renumberStockRows();
  return row;
}
buildStockRow();

addStockBtn.addEventListener("click", () => {
  if (stockRowsWrap.querySelectorAll(".stock-row").length >= STOCK_MAX) return;
  buildStockRow();
  scheduleUpdate();
});

// ---------- CTA link type (external URL / first stock section / contact form) ----------
function wireCtaLinkType(typeId, urlFieldWrapId) {
  const select = document.getElementById(typeId);
  const wrap = document.getElementById(urlFieldWrapId);
  const sync = () => { wrap.hidden = select.value !== "url"; };
  sync();
  select.addEventListener("change", () => { sync(); scheduleUpdate(); });
}
wireCtaLinkType("ctaPrimaryType", "ctaPrimaryUrlField");
wireCtaLinkType("ctaSecondaryType", "ctaSecondaryUrlField");

function resolveCtaHref(typeId, urlFieldId, prefix) {
  const type = val(typeId);
  if (type === "stock") return `#${prefix}-stock-1`;
  if (type === "enquire") return "#enquire";
  return val(urlFieldId);
}

// ---------- Collect state ----------
function collectOffers() {
  return [...offersList.querySelectorAll(".offer-row")].map((row) => ({
    title: row.querySelector(".offer-title").value,
    description: row.querySelector(".offer-desc").value,
  }));
}

function collectStockRows() {
  return [...stockRowsWrap.querySelectorAll(".stock-row")].map((row) => {
    const mode = row.querySelector(".stock-mode:checked").value;
    return {
      heading: row.querySelector(".stock-heading").value,
      intro: row.querySelector(".stock-intro").value,
      mode,
      conditions: [...row.querySelectorAll(".stock-cond:checked")].map((c) => c.value),
      models: row
        .querySelector(".stock-models")
        .value.split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      stockNumbers: row
        .querySelector(".stock-numbers")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      limit: row.querySelector(".stock-limit").value || "12",
    };
  });
}

function val(id) {
  return document.getElementById(id).value;
}
function checked(id) {
  return document.getElementById(id).checked;
}

function collectLandingState() {
  const brandName = val("brandName") || val("dealershipName") || "Custom";
  const prefix = slugify(brandName);
  const primaryColour = val("colourPrimary");
  return {
    brandName,
    // One accent colour is all the user sets - the hover/dark shade is
    // derived automatically (darkened toward black) rather than asking for
    // a second colour pick. "black" is a fixed unused-in-Slick constant;
    // kept only because generateCSS's Bold path (currently unexposed in the
    // UI, kept for a possible future premium tier) still reads it.
    colours: {
      primary: primaryColour,
      dark: mixHex(primaryColour, { r: 0, g: 0, b: 0 }, 0.35),
      black: "#0a0a0a",
    },
    // Bold is kept in templates.js for a possible future premium tier but
    // not exposed in the wizard - Slick is the only style on offer for now.
    style: "slick",
    urgencyEnabled: checked("urgencyEnabled"),
    urgencyText: val("urgencyText"),
    heroBrandLine: val("heroBrandLine"),
    heading: val("heading"),
    subheading: val("subheading"),
    paragraph: val("paragraph"),
    dateBannerEnabled: checked("dateBannerEnabled"),
    dateBannerText: val("dateBannerText"),
    ctaPrimaryText: val("ctaPrimaryText"),
    ctaPrimaryHref: resolveCtaHref("ctaPrimaryType", "ctaPrimaryHref", prefix),
    ctaSecondaryEnabled: checked("ctaSecondaryEnabled"),
    ctaSecondaryText: val("ctaSecondaryText"),
    ctaSecondaryHref: resolveCtaHref("ctaSecondaryType", "ctaSecondaryHref", prefix),
    formEnabled: checked("formEnabled"),
    formShortcode: val("formShortcode"),
    formHeading: val("formHeading"),
    offersEnabled: checked("offersEnabled"),
    offerHeading: val("offerHeading"),
    offerIntro: val("offerIntro"),
    offers: collectOffers(),
    financeEnabled: checked("financeEnabled"),
    financeHeadline: val("financeHeadline"),
    financeText: val("financeText"),
    stockEnabled: checked("stockEnabled"),
    stockRows: collectStockRows(),
    endingEnabled: checked("endingEnabled"),
    endingHeading: val("endingHeading"),
    endingText: val("endingText"),
    tcsEnabled: checked("tcsEnabled"),
    tcsHeading: val("tcsHeading"),
    tcsItems: val("tcsItems").split("\n").map((s) => s.trim()).filter(Boolean),
    tcsAccordion: checked("tcsAccordion"),
  };
}

// ---------- Preview (mock stock cards since real widget JS isn't available) ----------
function mockStockCardsHtml(prefix, row) {
  const sampleModel = row.models[0] || "Model";
  let cards = "";
  for (let i = 0; i < Math.min(3, Number(row.limit) || 3); i++) {
    cards += `
      <div style="background:#fff;color:#111;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);text-align:left;">
        <div style="height:120px;background:#e4e4e4;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">Vehicle photo</div>
        <div style="padding:12px;">
          <div style="font-weight:700;font-size:15px;">${escapeHtml(sampleModel)} ${row.conditions[0] || ""}</div>
          <div style="color:var(--${prefix}-primary,#c00);font-weight:700;margin-top:4px;">$00,000 drive away</div>
        </div>
      </div>`;
  }
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-top:16px;">${cards}</div>
  <p style="font-size:12px;opacity:0.6;margin-top:14px;">Preview only - real vehicles populate once this is live on your site.</p>`;
}

function buildPreviewDoc(state) {
  const prefix = slugify(state.brandName);
  const css = generateCSS(prefix, state.colours, state.style);
  let html = generateHTML(prefix, state);
  if (state.stockEnabled) {
    state.stockRows.forEach((row, i) => {
      const marker = new RegExp(
        `(<div class="featcars embla" id="${prefix}-stock-${i + 1}"[^>]*>)</div>`
      );
      html = html.replace(marker, `$1${mockStockCardsHtml(prefix, row)}</div>`);
    });
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>body{margin:0;font-family:Inter,Arial,sans-serif;background:#fff;}</style>
  ${css}
  </head><body>${html}</body></html>`;
}

// ---------- Generate / live-update gating ----------
let hasGenerated = false;
const previewPlaceholder = document.getElementById("previewPlaceholder");
const previewContent = document.getElementById("previewContent");

function scheduleUpdate() {
  if (!hasGenerated) return; // no preview until first Generate click
  clearTimeout(scheduleUpdate._t);
  scheduleUpdate._t = setTimeout(updateLandingOutputs, 200);
}

function updateLandingOutputs() {
  const state = collectLandingState();
  const code = generateFullCode(state);
  document.getElementById("landingCodeOutput").value = code;
  document.getElementById("previewFrame").srcdoc = buildPreviewDoc(state);
}

document.getElementById("generateBtn").addEventListener("click", () => {
  hasGenerated = true;
  previewPlaceholder.hidden = true;
  previewContent.hidden = false;
  updateLandingOutputs();
});

function wireLiveInputs(root) {
  root.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("input", scheduleUpdate);
    el.addEventListener("change", scheduleUpdate);
  });
}
wireLiveInputs(document.getElementById("panel-landing"));

document.getElementById("copyLandingCode").addEventListener("click", () => {
  copyToClipboard("landingCodeOutput");
});

function copyToClipboard(textareaId) {
  const ta = document.getElementById(textareaId);
  ta.select();
  navigator.clipboard.writeText(ta.value).catch(() => document.execCommand("copy"));
}

// ---------- Contact form tab ----------
// No raw "field name" is ever shown to the user - it's a technical HTML
// attribute (the form's `name=` + the email template's `{placeholder}`),
// not something a marketing manager needs to think about. Fixed fields get
// a conventional name (name/email/phone); Dropdown/Message names are
// derived from whatever label the user types, at generation time.
const formFieldsList = document.getElementById("formFieldsList");

const QUICK_FIELDS = {
  name: { type: "text", label: "Full Name", fixedName: "name", required: true, single: true },
  email: { type: "email", label: "Email", fixedName: "email", required: true, single: true },
  phone: { type: "tel", label: "Mobile", fixedName: "phone", required: true, single: true },
  message: { type: "textarea", label: "Message", fixedName: null, required: false, single: false },
  select: { type: "select", label: "", fixedName: null, required: false, single: false },
};

function slugifyFieldName(str, fallback) {
  const s = (str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return s || fallback;
}

function addOptionRow(list) {
  const optRow = document.createElement("div");
  optRow.className = "f-option-row";
  optRow.innerHTML = `
    <input type="text" class="f-option" placeholder="e.g. Sedan">
    <button type="button" class="remove-btn">Remove</button>
  `;
  list.appendChild(optRow);
  optRow.querySelector(".remove-btn").addEventListener("click", () => {
    optRow.remove();
    scheduleFormUpdate();
  });
  wireLiveInputs(optRow);
  return optRow;
}

function addQuickField(kind) {
  const cfg = QUICK_FIELDS[kind];
  const row = document.createElement("div");
  row.className = "field-row";
  row.dataset.fieldType = cfg.type;
  if (cfg.fixedName) row.dataset.fixedName = cfg.fixedName;

  const typeLabel = { text: "Full Name", email: "Email", tel: "Mobile", textarea: "Message", select: "Dropdown" }[cfg.type];
  const optionsBlock = cfg.type === "select"
    ? `<label>Dropdown options</label>
       <div class="f-options-list"></div>
       <button type="button" class="add-btn f-add-option">+ Add option</button>`
    : "";

  row.innerHTML = `
    <div class="field-row-head">
      <strong>${typeLabel}</strong>
      <button type="button" class="remove-btn">Remove</button>
    </div>
    <label>Label <input type="text" class="f-label" value="${escapeHtml(cfg.label)}" placeholder="${cfg.type === "select" ? "e.g. Vehicle Interested In" : ""}"></label>
    ${optionsBlock}
    <label class="checkbox"><input type="checkbox" class="f-required" ${cfg.required ? "checked" : ""}> Required</label>
  `;
  formFieldsList.appendChild(row);

  if (cfg.type === "select") {
    const optionsList = row.querySelector(".f-options-list");
    addOptionRow(optionsList);
    addOptionRow(optionsList);
    row.querySelector(".f-add-option").addEventListener("click", () => {
      addOptionRow(optionsList);
      scheduleFormUpdate();
    });
  }

  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    if (cfg.single) document.querySelector(`.quick-add-btn[data-quick="${kind}"]`).disabled = false;
    scheduleFormUpdate();
  });
  wireLiveInputs(row);

  if (cfg.single) document.querySelector(`.quick-add-btn[data-quick="${kind}"]`).disabled = true;
}

document.querySelectorAll(".quick-add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    addQuickField(btn.dataset.quick);
    scheduleFormUpdate();
  });
});

["name", "email", "phone"].forEach((k) => addQuickField(k));

function collectFormFields() {
  const used = new Set();
  return [...formFieldsList.querySelectorAll(".field-row")].map((row, i) => {
    const type = row.dataset.fieldType;
    const label = row.querySelector(".f-label").value.trim();
    let name = row.dataset.fixedName || slugifyFieldName(label, `${type}-${i + 1}`);
    let unique = name;
    let n = 2;
    while (used.has(unique)) { unique = `${name}-${n}`; n++; }
    used.add(unique);
    return {
      name: unique,
      id: unique,
      label,
      type,
      required: row.querySelector(".f-required").checked,
      options: [...row.querySelectorAll(".f-option")]
        .map((el) => el.value.trim())
        .filter(Boolean),
    };
  });
}

let hasFormGenerated = false;
const formPreviewPlaceholder = document.getElementById("formPreviewPlaceholder");
const formPreviewContent = document.getElementById("formPreviewContent");

function scheduleFormUpdate() {
  if (!hasFormGenerated) return;
  clearTimeout(scheduleFormUpdate._t);
  scheduleFormUpdate._t = setTimeout(updateFormOutputs, 200);
}

function updateFormOutputs() {
  const fields = collectFormFields().filter((f) => f.label);
  const opts = {
    submitLabel: val("submitLabel"),
    departmentEnabled: checked("departmentEnabled"),
    departmentValue: val("departmentValue"),
  };
  document.getElementById("formCodeOutput").value = generateFormHTML(fields, opts);
  document.getElementById("emailCodeOutput").value = generateEmailHTML(fields, opts);
}

document.getElementById("generateFormBtn").addEventListener("click", () => {
  hasFormGenerated = true;
  formPreviewPlaceholder.hidden = true;
  formPreviewContent.hidden = false;
  updateFormOutputs();
});

wireLiveInputs(document.getElementById("panel-form"));
document.getElementById("copyFormCode").addEventListener("click", () => copyToClipboard("formCodeOutput"));
document.getElementById("copyEmailCode").addEventListener("click", () => copyToClipboard("emailCodeOutput"));

// ---------- PMAX Copy tab ----------
const pmaxPreviewPlaceholder = document.getElementById("pmaxPreviewPlaceholder");
const pmaxPreviewContent = document.getElementById("pmaxPreviewContent");

function collectPmaxState() {
  return {
    dealer: val("pmaxDealer") || "the dealership",
    models: val("pmaxModels").split(",").map((m) => m.trim()).filter(Boolean),
    offerType: val("pmaxOfferType"),
    offerValue: val("pmaxOfferValue").trim(),
    scope: val("pmaxScope"),
    urgency: val("pmaxUrgency"),
    endDate: val("pmaxEndDate").trim(),
    tcsApply: checked("pmaxTcs"),
    driveAway: checked("pmaxDriveAway"),
  };
}

function updatePmaxOutput() {
  const state = collectPmaxState();
  const result = generatePmaxCopy(state);
  document.getElementById("pmaxCodeOutput").value = formatPmaxOutput(result);
}

document.getElementById("generatePmaxBtn").addEventListener("click", () => {
  pmaxPreviewPlaceholder.hidden = true;
  pmaxPreviewContent.hidden = false;
  updatePmaxOutput();
});

document.getElementById("copyPmaxCode").addEventListener("click", () => copyToClipboard("pmaxCodeOutput"));

// ---------- Init ----------
applyBrandColours();
