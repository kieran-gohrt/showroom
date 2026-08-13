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
  document.getElementById("colourDark").value = b.dark;
  document.getElementById("colourBlack").value = b.black;
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

// ---------- Stock rows ----------
const stockRowsWrap = document.getElementById("stockRows");
function buildStockRow(index) {
  const row = document.createElement("div");
  row.className = "stock-row";
  row.dataset.row = index;
  row.innerHTML = `
    <label>Section heading <input type="text" class="stock-heading" placeholder="e.g. New Arrivals"></label>
    <label>Intro text <input type="text" class="stock-intro" placeholder="e.g. Explore our latest new arrivals."></label>
    <label class="checkbox"><input type="checkbox" class="stock-cond" value="New" checked> New</label>
    <label class="checkbox"><input type="checkbox" class="stock-cond" value="Demo"> Demo</label>
    <label class="checkbox"><input type="checkbox" class="stock-cond" value="Used"> Used</label>
    <label>Models (comma-separated, matching the dealer site's exact model names) <input type="text" class="stock-models" placeholder="e.g. Tucson, Kona"></label>
    <label>Card limit <input type="number" class="stock-limit" value="12" min="1" max="24"></label>
  `;
  return row;
}
stockRowsWrap.appendChild(buildStockRow(1));

const stockRow2Checkbox = document.getElementById("stockRow2Enabled");
let stockRow2El = null;
stockRow2Checkbox.addEventListener("change", () => {
  if (stockRow2Checkbox.checked && !stockRow2El) {
    stockRow2El = buildStockRow(2);
    stockRowsWrap.appendChild(stockRow2El);
    wireLiveInputs(stockRow2El);
  } else if (!stockRow2Checkbox.checked && stockRow2El) {
    stockRow2El.remove();
    stockRow2El = null;
  }
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
  return [...stockRowsWrap.querySelectorAll(".stock-row")].map((row) => ({
    heading: row.querySelector(".stock-heading").value,
    intro: row.querySelector(".stock-intro").value,
    conditions: [...row.querySelectorAll(".stock-cond:checked")].map((c) => c.value),
    models: row
      .querySelector(".stock-models")
      .value.split(",")
      .map((m) => m.trim())
      .filter(Boolean),
    limit: row.querySelector(".stock-limit").value || "12",
  }));
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
  return {
    brandName,
    colours: {
      primary: val("colourPrimary"),
      dark: val("colourDark"),
      black: val("colourBlack"),
    },
    style: document.querySelector('input[name="style"]:checked').value,
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
  <p style="font-size:12px;opacity:0.6;margin-top:14px;">Preview only — real vehicles populate once this is live on your site.</p>`;
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
const formFieldsList = document.getElementById("formFieldsList");

function addFieldRow(defaults = {}) {
  const row = document.createElement("div");
  row.className = "field-row";
  const name = defaults.name || "";
  row.innerHTML = `
    <div class="field-row-head">
      <strong>Field</strong>
      <button type="button" class="remove-btn">Remove</button>
    </div>
    <label>Field name (used as form 'name' + email placeholder)
      <input type="text" class="f-name" value="${name}">
    </label>
    <label>Label
      <input type="text" class="f-label" value="${defaults.label || ""}">
    </label>
    <label>Type
      <select class="f-type">
        <option value="text" ${defaults.type === "text" ? "selected" : ""}>Text</option>
        <option value="email" ${defaults.type === "email" ? "selected" : ""}>Email</option>
        <option value="tel" ${defaults.type === "tel" ? "selected" : ""}>Phone</option>
        <option value="select" ${defaults.type === "select" ? "selected" : ""}>Dropdown</option>
        <option value="textarea" ${defaults.type === "textarea" ? "selected" : ""}>Message / textarea</option>
      </select>
    </label>
    <label class="f-options-wrap" style="display:${defaults.type === "select" ? "block" : "none"}">Dropdown options (one per line)
      <textarea class="f-options" rows="3">${(defaults.options || []).join("\n")}</textarea>
    </label>
    <label class="checkbox"><input type="checkbox" class="f-required" ${defaults.required ? "checked" : ""}> Required</label>
  `;
  formFieldsList.appendChild(row);

  const typeSelect = row.querySelector(".f-type");
  const optionsWrap = row.querySelector(".f-options-wrap");
  typeSelect.addEventListener("change", () => {
    optionsWrap.style.display = typeSelect.value === "select" ? "block" : "none";
    scheduleFormUpdate();
  });
  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    scheduleFormUpdate();
  });
  wireLiveInputs(row);
}

[
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Mobile", type: "tel", required: true },
].forEach((f) => addFieldRow(f));

document.getElementById("addFieldBtn").addEventListener("click", () => addFieldRow());

function collectFormFields() {
  return [...formFieldsList.querySelectorAll(".field-row")].map((row) => {
    const name = row.querySelector(".f-name").value.trim();
    const type = row.querySelector(".f-type").value;
    return {
      name,
      id: name,
      label: row.querySelector(".f-label").value.trim(),
      type,
      required: row.querySelector(".f-required").checked,
      options: row
        .querySelector(".f-options")
        .value.split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  });
}

function scheduleFormUpdate() {
  clearTimeout(scheduleFormUpdate._t);
  scheduleFormUpdate._t = setTimeout(updateFormOutputs, 200);
}

function updateFormOutputs() {
  const fields = collectFormFields().filter((f) => f.name);
  const opts = {
    submitLabel: val("submitLabel"),
    departmentEnabled: checked("departmentEnabled"),
    departmentValue: val("departmentValue"),
  };
  document.getElementById("formCodeOutput").value = generateFormHTML(fields, opts);
  document.getElementById("emailCodeOutput").value = generateEmailHTML(fields, opts);
}

wireLiveInputs(document.getElementById("panel-form"));
document.getElementById("copyFormCode").addEventListener("click", () => copyToClipboard("formCodeOutput"));
document.getElementById("copyEmailCode").addEventListener("click", () => copyToClipboard("emailCodeOutput"));

// ---------- Init ----------
applyBrandColours();
updateFormOutputs();
