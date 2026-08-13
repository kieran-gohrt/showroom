/* Generator core: turns wizard state into a copy-paste-ready <style>+<section> block.
 * Structure is fixed (per the reference Mazda EOFY template + live AdTorque site audit).
 * Only CSS variable values, the "bold" vs "slick" token set, and the copy/toggles change.
 */

function slugify(str) {
  return (str || "brand")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "brand";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const c = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

// True WCAG relative luminance (0 black - 1 white), gamma-corrected - unlike
// a simple weighted-brightness average, this doesn't unfairly flag saturated
// colours (e.g. a pure red reads as "dark" under naive weighting despite
// having decent real contrast against black).
function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const chan = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(hex, targetRgb, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (targetRgb.r - r) * amount,
    g + (targetRgb.g - g) * amount,
    b + (targetRgb.b - b) * amount
  );
}

// A brand's accent colour is used directly as small text/border on a dark
// (bold) or light (slick) background. If the colour itself doesn't have
// enough real contrast against that background it becomes unreadable -
// this happens for any muted/near-black or near-white brand colour, not
// just one brand. Nudge it toward white/black just enough to clear a
// minimum contrast ratio, leaving already-legible colours (saturated reds,
// blues, etc.) untouched. The true brand colour is kept everywhere else
// (buttons, fills) where it sits under white text instead.
function accentTextColour(hex, style) {
  const bg = style === "bold" ? "#0a0a0a" : "#ffffff";
  const toward = style === "bold" ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  let result = hex;
  let amount = 0;
  while (contrastRatio(result, bg) < 3.2 && amount < 0.9) {
    amount += 0.12;
    result = mixHex(hex, toward, amount);
  }
  return result;
}

// Real production syntax confirmed live on AdTorque Edge sites:
// data-query="condition=New,Demo&make[Isuzu]=D-MAX"                  (filter by condition/model)
// data-query="make[Isuzu]=&keywords=31027237,31421545,31421614"      (manual stock number list)
function buildStockQuery(row, brand) {
  const brandKey = brand || "";
  if (row.mode === "manual") {
    const parts = [`make[${brandKey}]=`];
    if (row.stockNumbers && row.stockNumbers.length) {
      parts.push(`keywords=${row.stockNumbers.join(",")}`);
    }
    return parts.join("&");
  }
  const parts = [];
  if (row.conditions && row.conditions.length) {
    parts.push(`condition=${row.conditions.join(",")}`);
  }
  if (row.models && row.models.length) {
    parts.push(`make[${brandKey}]=${row.models.join(",")}`);
  } else if (brandKey) {
    parts.push(`make[${brandKey}]=`);
  }
  return parts.join("&");
}

function getThemeTokens(style, colours) {
  const { primary, dark, black } = colours;
  if (style === "bold") {
    return {
      pageBg: `radial-gradient(circle at 50% 10%, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 28%, rgba(0,0,0,0) 58%), radial-gradient(circle at 15% 18%, ${hexToRgba(primary, 0.24)}, rgba(0,0,0,0) 30%), radial-gradient(circle at 85% 30%, ${hexToRgba(primary, 0.2)}, rgba(0,0,0,0) 28%), linear-gradient(180deg, ${black} 0%, #101010 52%, ${black} 100%)`,
      overlayDots: true,
      textColor: "#ffffff",
      mutedText: "rgba(255,255,255,0.78)",
      bodyCopy: "#d8d8d8",
      heroH1Color: "#ffffff",
      dateBannerTransform: "",
      dateBannerClip: "",
      dateBannerRadius: "border-radius: 999px;",
      panelBg: `linear-gradient(145deg, rgba(255,255,255,0.105), rgba(255,255,255,0.035)), radial-gradient(circle at top center, ${hexToRgba(primary, 0.18)}, rgba(0,0,0,0) 45%)`,
      panelBorder: "rgba(255,255,255,0.16)",
      panelShadow: "0 26px 72px rgba(0,0,0,0.46)",
      cardBg: `linear-gradient(180deg, ${hexToRgba(primary, 0.18)}, ${hexToRgba(primary, 0)}), rgba(0,0,0,0.34)`,
      cardBorder: "rgba(255,255,255,0.14)",
      cardText: "#ffffff",
      sectionBg: "rgba(255,255,255,0.08)",
      sectionBorder: "rgba(255,255,255,0.16)",
      sectionBackdrop: "backdrop-filter: blur(10px);",
      btnTextColor: "#ffffff",
      btnBorder: "1px solid rgba(255,255,255,0.18)",
      btnShadow: `0 16px 34px ${hexToRgba(primary, 0.28)}`,
    };
  }
  // slick
  return {
    pageBg: "#ffffff",
    overlayDots: false,
    textColor: "#111111",
    mutedText: "#555555",
    bodyCopy: "#4a4a4a",
    heroH1Color: "#111111",
    dateBannerTransform: "",
    dateBannerClip: "",
    dateBannerRadius: "border-radius: 999px;",
    panelBg: "#f7f7f6",
    panelBorder: "rgba(0,0,0,0.08)",
    panelShadow: "0 16px 40px rgba(0,0,0,0.06)",
    cardBg: "#ffffff",
    cardBorder: "rgba(0,0,0,0.10)",
    cardText: "#111111",
    sectionBg: "#f7f7f6",
    sectionBorder: "rgba(0,0,0,0.08)",
    sectionBackdrop: "",
    btnTextColor: "#ffffff",
    btnBorder: "1px solid rgba(0,0,0,0.06)",
    btnShadow: `0 12px 24px ${hexToRgba(primary, 0.22)}`,
  };
}

function generateCSS(prefix, colours, style) {
  const t = getThemeTokens(style, colours);
  const isBold = style === "bold";
  // Guaranteed-legible version of the brand colour for small text/borders
  // sitting directly on the page background (see accentTextColour above).
  const accentText = accentTextColour(colours.primary, style);
  return `<style>
    :root {
        --${prefix}-primary: ${colours.primary};
        --${prefix}-primary-dark: ${colours.dark};
        --${prefix}-accent-text: ${accentText};
        --${prefix}-black: ${colours.black};
        --${prefix}-white: #ffffff;
        --${prefix}-grey: ${isBold ? "#d8d8d8" : "#5a5a5a"};
        --${prefix}-border: ${t.panelBorder};
    }

    .${prefix}-page {
        position: relative;
        overflow: hidden;
        background: ${t.pageBg};
        color: var(--${prefix}-white, ${t.textColor}) !important;
        text-align: center;
    }

    .${prefix}-page * { box-sizing: border-box; }

    ${t.overlayDots ? `.${prefix}-page::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
            radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(135deg, rgba(255,255,255,0.045), transparent 34%);
        background-size: 6px 6px, 100% 100%;
        opacity: 0.16;
        pointer-events: none;
    }` : ""}

    .${prefix}-wrapper {
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        padding: 56px 0 48px;
        position: relative;
        z-index: 2;
    }

    .${prefix}-urgency-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 14px;
        margin: 0 auto 16px;
        border-radius: 999px;
        background: ${isBold ? "rgba(255,255,255,0.1)" : "#111111"};
        color: #fff !important;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid ${isBold ? "rgba(255,255,255,0.2)" : "transparent"};
    }

    .${prefix}-hero { position: relative; max-width: 720px; margin: 0 auto; }

    .${prefix}-hero-brand {
        margin: 0 0 6px;
        color: var(--${prefix}-accent-text) !important;
        font-size: clamp(12px, 1.1vw, 15px);
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .${prefix}-hero h1 {
        margin: 0;
        color: ${t.heroH1Color} !important;
        font-size: clamp(28px, 4vw, 48px);
        line-height: 1.08;
        font-weight: 850;
        letter-spacing: -0.03em;
        text-transform: uppercase;
        text-wrap: balance;
        overflow-wrap: break-word;
    }

    .${prefix}-hero h2 {
        margin: 8px auto 16px;
        color: ${t.heroH1Color} !important;
        font-size: clamp(18px, 2.4vw, 28px);
        line-height: 1.15;
        font-weight: 750;
        letter-spacing: -0.02em;
        text-transform: uppercase;
        text-wrap: balance;
    }

    .${prefix}-hero-copy {
        max-width: 560px;
        margin: 0 auto 22px;
        color: var(--${prefix}-grey) !important;
        font-size: clamp(14px, 1.1vw, 16px);
        line-height: 1.55;
    }

    .${prefix}-hero-copy strong { color: ${t.heroH1Color} !important; font-weight: 900; }

    .${prefix}-date-banner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 7px 16px;
        margin: 0 auto 22px;
        background: ${hexToRgba(colours.primary, isBold ? 0.16 : 0.08)};
        color: var(--${prefix}-accent-text) !important;
        font-size: clamp(11px, 1vw, 13px);
        line-height: 1.2;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        ${t.dateBannerTransform}
        ${t.dateBannerClip}
        ${t.dateBannerRadius}
        border: 1px solid ${hexToRgba(accentText, 0.5)};
    }

    .${prefix}-cta-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin: 0 auto;
    }

    .${prefix}-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 11px 22px;
        border-radius: 8px;
        background: var(--${prefix}-primary);
        color: ${t.btnTextColor} !important;
        border: ${t.btnBorder};
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        text-decoration: none !important;
        box-shadow: ${t.btnShadow};
        transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }

    .${prefix}-btn:hover { transform: translateY(-2px); background: var(--${prefix}-primary-dark); }

    .${prefix}-btn-secondary {
        background: transparent;
        color: ${isBold ? "#fff" : "#111111"} !important;
        border: 1px solid ${isBold ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.18)"};
        box-shadow: none;
    }

    .${prefix}-btn-secondary:hover { background: ${isBold ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}; }

    .${prefix}-offer-panel {
        margin: 40px auto 0;
        padding: 32px 26px;
        border-radius: 20px;
        border: 1px solid ${t.panelBorder};
        background: ${t.panelBg};
        box-shadow: ${t.panelShadow};
        text-align: center;
        color: ${t.heroH1Color} !important;
    }

    .${prefix}-offer-panel h3 {
        margin: 0 0 10px;
        color: ${t.heroH1Color} !important;
        font-size: clamp(20px, 2.4vw, 28px);
        line-height: 1.15;
        font-weight: 800;
        letter-spacing: -0.02em;
        text-transform: uppercase;
    }

    .${prefix}-offer-intro {
        max-width: 640px;
        margin: 0 auto 26px;
        color: var(--${prefix}-grey) !important;
        font-size: 14.5px;
        line-height: 1.55;
    }

    .${prefix}-offer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin: 0 auto 20px;
    }

    .${prefix}-offer-card {
        position: relative;
        overflow: hidden;
        padding: 22px 18px;
        border-radius: 14px;
        border: 1px solid ${t.cardBorder};
        background: ${t.cardBg};
        box-shadow: ${isBold ? "inset 0 0 0 1px rgba(255,255,255,0.04), 0 10px 24px rgba(0,0,0,0.3)" : "0 6px 16px rgba(0,0,0,0.05)"};
        text-align: center;
    }

    .${prefix}-offer-card::before {
        content: "";
        position: absolute;
        top: 0; left: 50%;
        width: 56%; height: 3px;
        background: var(--${prefix}-primary);
        transform: translateX(-50%);
        ${isBold ? `box-shadow: 0 0 14px ${hexToRgba(colours.primary, 0.7)};` : ""}
    }

    .${prefix}-offer-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px; height: 32px;
        margin: 0 auto 12px;
        border-radius: 50%;
        background: var(--${prefix}-primary);
        color: #fff;
        font-size: 14px;
        font-weight: 800;
    }

    .${prefix}-offer-card h4 {
        margin: 0 0 8px;
        color: ${t.cardText} !important;
        font-size: clamp(15px, 1.5vw, 18px);
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: -0.01em;
        text-transform: uppercase;
    }

    .${prefix}-offer-card p {
        max-width: 280px;
        margin: 0 auto;
        color: ${isBold ? "var(--" + prefix + "-grey)" : "#555555"} !important;
        font-size: 13px;
        line-height: 1.5;
    }

    .${prefix}-finance-teaser {
        margin: 18px auto 0;
        padding: 18px 20px;
        border-radius: 14px;
        border: 1px dashed var(--${prefix}-accent-text);
        background: ${isBold ? hexToRgba(colours.primary, 0.08) : hexToRgba(colours.primary, 0.05)};
        text-align: center;
    }

    .${prefix}-finance-teaser strong {
        display: block;
        color: var(--${prefix}-accent-text) !important;
        font-size: 18px;
        font-weight: 800;
        margin-bottom: 4px;
    }

    .${prefix}-finance-teaser p { margin: 0; color: ${t.mutedText} !important; font-size: 13px; }

    .${prefix}-ending-panel {
        margin: 24px auto 0;
        padding: 24px 22px;
        border-radius: 18px;
        background: ${t.sectionBg};
        border: 1px solid ${t.sectionBorder};
        color: ${t.heroH1Color} !important;
        text-align: center;
        ${t.sectionBackdrop}
    }

    .${prefix}-ending-panel h3 {
        margin: 0 0 8px;
        color: ${t.heroH1Color} !important;
        font-size: clamp(18px, 2.2vw, 24px);
        font-weight: 800;
        letter-spacing: -0.02em;
        text-transform: uppercase;
    }

    .${prefix}-ending-panel p { max-width: 620px; margin: 0 auto; color: ${t.mutedText} !important; font-size: 14px; line-height: 1.55; }

    .${prefix}-stock-section {
        position: relative;
        margin: 24px auto 0;
        padding: 28px 22px 56px;
        border-radius: 20px;
        background: ${t.sectionBg};
        border: 1px solid ${t.sectionBorder};
        color: ${t.heroH1Color} !important;
        text-align: center;
        overflow: hidden;
        ${t.sectionBackdrop}
    }

    .${prefix}-stock-section h3 {
        margin: 0 0 6px;
        color: ${t.heroH1Color} !important;
        font-size: clamp(17px, 1.8vw, 22px);
        font-weight: 800;
        letter-spacing: -0.01em;
        text-transform: uppercase;
    }

    .${prefix}-stock-section > p { max-width: 560px; margin: 0 auto 18px; color: ${t.mutedText} !important; font-size: 14px; line-height: 1.5; }

    .${prefix}-stock-section .featcars, .${prefix}-stock-section .embla { position: relative; overflow: visible; }
    .${prefix}-stock-section .embla__viewport { overflow: hidden; }

    .${prefix}-stock-section .embla__buttons,
    .${prefix}-stock-section .embla__controls {
        position: relative !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 12px !important;
        width: 100% !important;
        margin: 20px auto 0 !important;
        z-index: 5 !important;
    }

    .${prefix}-stock-section .embla__button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 42px !important; height: 42px !important;
        border-radius: 50% !important;
        border: 1px solid var(--${prefix}-primary) !important;
        background: var(--${prefix}-primary) !important;
        color: #fff !important;
    }

    /* Confirmed real markup (inspected live on an AdTorque Edge site):
       <div class="cow equal-height just-arrived">
         <a href="..."></a>
         <div class="cow-img" data-banner="..."><img ...></div>
         <h2>2026 Hyundai Tucson Elite Auto 2WD MY26</h2>
         <div class="cow-price-cat"><h3>
           <span class="t-was">A$39,888</span>
           <span class="price-marg"><span class="t-large">A$38,480</span> <span class="price-text">Ex Govt Charges</span></span>
         </h3></div>
         <div class="cow-content"><ul class="cow-il"><li><span>New</span></li>...</ul></div>
       </div>
       Fallback generic selectors are kept alongside in case another dealer
       site's build differs - tell us the real class name if either misses. */
    .${prefix}-stock-section .cow,
    .${prefix}-stock-section .vehicle-card,
    .${prefix}-stock-section .card,
    .${prefix}-stock-section article {
        position: relative !important;
        overflow: hidden;
        background: #fff !important;
        color: #111 !important;
    }

    /* The vehicle photo/title/price is wrapped by an empty <a> that overlays
       the whole card to make it clickable. Force it on top explicitly so it
       can't get covered by our display:block overrides above. */
    .${prefix}-stock-section .cow > a:first-child {
        position: absolute !important;
        inset: 0 !important;
        z-index: 6 !important;
        display: block !important;
    }

    .${prefix}-stock-section .cow h2,
    .${prefix}-stock-section h4,
    .${prefix}-stock-section .title,
    .${prefix}-stock-section [class*="title"],
    .${prefix}-stock-section [class*="Title"] {
        font-size: 15px !important;
        line-height: 1.25 !important;
        font-weight: 700 !important;
        white-space: normal !important;
        overflow: visible !important;
        text-overflow: clip !important;
        -webkit-line-clamp: unset !important;
        display: block !important;
        text-align: center !important;
        margin: 10px 0 6px !important;
    }

    .${prefix}-stock-section .cow-price-cat,
    .${prefix}-stock-section .cow-price-cat h3 {
        display: block !important;
        text-align: center !important;
    }

    .${prefix}-stock-section .t-large,
    .${prefix}-stock-section .price,
    .${prefix}-stock-section [class*="price"],
    .${prefix}-stock-section [class*="Price"] {
        color: var(--${prefix}-primary) !important;
        font-weight: 700 !important;
        font-size: 14px !important;
        line-height: 1.3 !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        max-width: 100% !important;
    }

    .${prefix}-stock-section .price-text {
        color: #777 !important;
        font-weight: 500 !important;
        font-size: 11px !important;
    }

    .${prefix}-stock-section .t-was,
    .${prefix}-stock-section s,
    .${prefix}-stock-section strike,
    .${prefix}-stock-section del,
    .${prefix}-stock-section [class*="was"],
    .${prefix}-stock-section [class*="Was"] {
        color: #9a9a9a !important;
        font-size: 12px !important;
        display: inline-block !important;
    }

    .${prefix}-stock-section .cow-content,
    .${prefix}-stock-section .cow-il,
    .${prefix}-stock-section .badge,
    .${prefix}-stock-section .tag,
    .${prefix}-stock-section .spec,
    .${prefix}-stock-section .specs,
    .${prefix}-stock-section .attribute,
    .${prefix}-stock-section .attributes,
    .${prefix}-stock-section [class*="badge"],
    .${prefix}-stock-section [class*="tag"],
    .${prefix}-stock-section [class*="spec"],
    .${prefix}-stock-section [class*="Spec"],
    .${prefix}-stock-section [class*="attribute"],
    .${prefix}-stock-section [class*="Attribute"] {
        display: none !important;
    }

    .${prefix}-tcs {
        max-width: 720px;
        margin: 32px auto 0;
        padding: 22px 22px;
        border-radius: 16px;
        background: ${isBold ? "rgba(255,255,255,0.06)" : "#f7f7f6"};
        border: 1px solid ${t.sectionBorder};
        color: ${t.mutedText} !important;
        text-align: center;
    }

    .${prefix}-tcs h4 {
        margin: 0 0 10px;
        color: ${t.heroH1Color} !important;
        font-size: 14px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .${prefix}-tcs ul { list-style-position: inside; margin: 0; padding: 0; }
    .${prefix}-tcs li { margin: 0 0 6px; color: ${t.mutedText} !important; font-size: 11.5px; line-height: 1.6; }
    .${prefix}-tcs li:last-child { margin-bottom: 0; }

    .${prefix}-tcs details { text-align: left; margin: 0 0 8px; }
    .${prefix}-tcs summary { cursor: pointer; font-weight: 700; font-size: 12.5px; color: ${t.heroH1Color} !important; margin-bottom: 8px; }

    @media (max-width: 900px) {
        .${prefix}-wrapper { padding: 44px 0 36px; }
        .${prefix}-stock-section { padding: 22px 16px 52px; }
    }

    @media (max-width: 600px) {
        .${prefix}-wrapper { width: min(100% - 24px, 1180px); }
        .${prefix}-hero h1 { font-size: clamp(26px, 8vw, 36px); }
        .${prefix}-hero h2 { font-size: clamp(17px, 5vw, 22px); }
        .${prefix}-cta-row { flex-direction: column; }
        .${prefix}-btn { width: 100%; }
        .${prefix}-offer-panel { padding: 24px 16px; border-radius: 16px; }
        .${prefix}-stock-section { padding-bottom: 60px; }
    }
</style>`;
}

function generateHTML(prefix, state) {
  const primaryModel = state.stockRows[0];
  const offerCards = state.offers
    .map(
      (o, i) => `
                <div class="${prefix}-offer-card">
                    <div class="${prefix}-offer-number">${i + 1}</div>
                    <h4>${escapeHtml(o.title)}</h4>
                    <p>${escapeHtml(o.description)}</p>
                </div>`
    )
    .join("");

  const stockRowsHtml = state.stockEnabled
    ? state.stockRows
        .map((row, i) => {
          const query = buildStockQuery(row, state.brandName);
          return `
        <div class="${prefix}-stock-section">
            <h3>${escapeHtml(row.heading)}</h3>
            <p>${escapeHtml(row.intro)}</p>
            <div class="featcars embla" id="${prefix}-stock-${i + 1}" data-path="stock" data-query="${query}" data-limit="${row.limit}" data-layout="" data-dots="true" data-arrows="false"></div>
        </div>`;
        })
        .join("")
    : "";

  const financeHtml = state.financeEnabled
    ? `
            <div class="${prefix}-finance-teaser">
                <strong>${escapeHtml(state.financeHeadline)}</strong>
                <p>${escapeHtml(state.financeText)}</p>
            </div>`
    : "";

  const tcsHtml = state.tcsEnabled
    ? state.tcsAccordion
      ? `
    <div class="${prefix}-tcs">
        <h4>${escapeHtml(state.tcsHeading)}</h4>
        <details>
            <summary>View full terms &amp; conditions</summary>
            <ul>
                ${state.tcsItems.map((li) => `<li>${escapeHtml(li)}</li>`).join("\n                ")}
            </ul>
        </details>
    </div>`
      : `
    <div class="${prefix}-tcs">
        <h4>${escapeHtml(state.tcsHeading)}</h4>
        <ul>
            ${state.tcsItems.map((li) => `<li>${escapeHtml(li)}</li>`).join("\n            ")}
        </ul>
    </div>`
    : "";

  const endingHtml = state.endingEnabled
    ? `
        <div class="${prefix}-ending-panel">
            <h3>${escapeHtml(state.endingHeading)}</h3>
            <p>${escapeHtml(state.endingText)}</p>
        </div>`
    : "";

  const urgencyHtml = state.urgencyEnabled
    ? `<div class="${prefix}-urgency-badge">${escapeHtml(state.urgencyText)}</div>`
    : "";

  const secondaryCtaHtml = state.ctaSecondaryEnabled
    ? `<a href="${escapeHtml(state.ctaSecondaryHref)}" class="${prefix}-btn ${prefix}-btn-secondary">${escapeHtml(state.ctaSecondaryText)}</a>`
    : "";

  // Matches the AdTorque theme's own contact-form pattern verbatim (confirmed
  // from a real reference template): a plain anchor + the theme's global
  // "content grey-bg" / "sml-wrapper t-center" classes wrapping whatever
  // [ate-form ...] shortcode the user pastes in. Never escape the shortcode
  // itself - it must render as literal WordPress shortcode text, not HTML
  // entities, for the theme to parse it.
  const formHtml = state.formEnabled
    ? `
<span id="enquire" class="anchor"></span>
<section class="content grey-bg">
    <div class="sml-wrapper t-center">
        <h2 class="h1">${escapeHtml(state.formHeading || "Enquire Now")}</h2>
        ${state.formShortcode || '<!-- PASTE YOUR FORM SHORTCODE HERE, e.g. [ate-form title="Contact Form"] - create the form in WordPress first, then paste its shortcode in place of this comment -->'}
    </div>
</section>`
    : "";

  const offerPanelHtml = state.offersEnabled
    ? `
        <div class="${prefix}-offer-panel">
            <h3>${escapeHtml(state.offerHeading)}</h3>
            <p class="${prefix}-offer-intro">${escapeHtml(state.offerIntro)}</p>
            <div class="${prefix}-offer-grid">${offerCards}
            </div>${financeHtml}
        </div>`
    : "";

  return `<section class="${prefix}-page">
    <div class="${prefix}-wrapper">

        ${urgencyHtml}

        <div class="${prefix}-hero">
            <p class="${prefix}-hero-brand">${escapeHtml(state.heroBrandLine)}</p>
            <h1>${escapeHtml(state.heading)}</h1>
            <h2>${escapeHtml(state.subheading)}</h2>

            <p class="${prefix}-hero-copy">${escapeHtml(state.paragraph)}</p>

            ${state.dateBannerEnabled ? `<div class="${prefix}-date-banner">${escapeHtml(state.dateBannerText)}</div>` : ""}

            <div class="${prefix}-cta-row">
                <a href="${escapeHtml(state.ctaPrimaryHref)}" class="${prefix}-btn">${escapeHtml(state.ctaPrimaryText)}</a>
                ${secondaryCtaHtml}
            </div>
        </div>
        ${formHtml}
        ${offerPanelHtml}
        ${stockRowsHtml}
        ${endingHtml}
        ${tcsHtml}
    </div>
</section>`;
}

function generateFullCode(state) {
  const prefix = slugify(state.brandName);
  const css = generateCSS(prefix, state.colours, state.style);
  const html = generateHTML(prefix, state);
  return `${css}\n\n${html}`;
}
