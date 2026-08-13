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

// Real production syntax confirmed live on an AdTorque Edge site:
// data-query="condition=New,Demo&make[Isuzu]=D-MAX"
function buildStockQuery(conditions, brand, models) {
  const parts = [];
  if (conditions && conditions.length) {
    parts.push(`condition=${conditions.join(",")}`);
  }
  const brandKey = brand || "";
  if (models && models.length) {
    parts.push(`make[${brandKey}]=${models.join(",")}`);
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
      dateBannerTransform: "transform: rotate(-2deg);",
      dateBannerClip: "clip-path: polygon(3% 0, 100% 8%, 97% 100%, 0 90%);",
      dateBannerRadius: "",
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
  return `<style>
    :root {
        --${prefix}-primary: ${colours.primary};
        --${prefix}-primary-dark: ${colours.dark};
        --${prefix}-black: ${colours.black};
        --${prefix}-white: #ffffff;
        --${prefix}-grey: ${isBold ? "#d8d8d8" : "#5a5a5a"};
        --${prefix}-border: ${t.panelBorder};
    }

    .${prefix}-page {
        position: relative;
        overflow: hidden;
        background: ${t.pageBg};
        color: var(--${prefix}-white, ${t.textColor});
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
        padding: 92px 0 72px;
        position: relative;
        z-index: 2;
    }

    .${prefix}-event-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 22px;
        margin: 0 auto 28px;
        border-radius: 999px;
        background: var(--${prefix}-primary);
        color: #fff;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        border: 1px solid rgba(255,255,255,0.18);
        box-shadow: 0 0 34px ${hexToRgba(colours.primary, 0.32)};
    }

    .${prefix}-urgency-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 18px;
        margin: 0 auto 20px;
        border-radius: 999px;
        background: ${isBold ? "rgba(255,255,255,0.1)" : "#111111"};
        color: #fff;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        border: 1px solid ${isBold ? "rgba(255,255,255,0.2)" : "transparent"};
    }

    .${prefix}-hero { position: relative; max-width: 1040px; margin: 0 auto; }

    .${prefix}-hero-brand {
        margin: 0 0 6px;
        color: var(--${prefix}-primary);
        font-size: clamp(28px, 4vw, 54px);
        line-height: 0.95;
        font-weight: 950;
        letter-spacing: -0.04em;
        text-transform: uppercase;
    }

    .${prefix}-hero h1 {
        margin: 0;
        color: ${t.heroH1Color};
        font-size: clamp(58px, 10.8vw, 148px);
        line-height: 0.86;
        font-weight: 950;
        letter-spacing: -0.075em;
        text-transform: uppercase;
    }

    .${prefix}-hero h2 {
        margin: 14px auto 24px;
        color: ${t.heroH1Color};
        font-size: clamp(34px, 6vw, 78px);
        line-height: 0.95;
        font-weight: 950;
        letter-spacing: -0.05em;
        text-transform: uppercase;
    }

    .${prefix}-hero-copy {
        max-width: 860px;
        margin: 0 auto 30px;
        color: var(--${prefix}-grey);
        font-size: clamp(17px, 2vw, 22px);
        line-height: 1.5;
    }

    .${prefix}-hero-copy strong { color: ${t.heroH1Color}; font-weight: 900; }

    .${prefix}-date-banner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 16px 34px;
        margin: 6px auto 42px;
        background: var(--${prefix}-primary);
        color: #fff;
        font-size: clamp(22px, 3.2vw, 40px);
        line-height: 1;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        ${t.dateBannerTransform}
        ${t.dateBannerClip}
        ${t.dateBannerRadius}
        box-shadow: 0 18px 40px rgba(0,0,0,0.35);
    }

    .${prefix}-cta-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 14px;
        margin: 0 auto;
    }

    .${prefix}-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 54px;
        padding: 16px 32px;
        border-radius: 999px;
        background: var(--${prefix}-primary);
        color: ${t.btnTextColor} !important;
        border: ${t.btnBorder};
        font-size: 16px;
        font-weight: 900;
        letter-spacing: 0.04em;
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
        margin: 64px auto 0;
        padding: 42px 34px;
        border-radius: 32px;
        border: 1px solid ${t.panelBorder};
        background: ${t.panelBg};
        box-shadow: ${t.panelShadow};
        text-align: center;
    }

    .${prefix}-offer-panel h3 {
        margin: 0 0 12px;
        color: ${t.heroH1Color};
        font-size: clamp(34px, 5vw, 66px);
        line-height: 0.95;
        font-weight: 950;
        letter-spacing: -0.055em;
        text-transform: uppercase;
    }

    .${prefix}-offer-intro {
        max-width: 840px;
        margin: 0 auto 34px;
        color: var(--${prefix}-grey);
        font-size: 19px;
        line-height: 1.55;
    }

    .${prefix}-offer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 22px;
        margin: 0 auto 26px;
    }

    .${prefix}-offer-card {
        position: relative;
        overflow: hidden;
        min-height: 240px;
        padding: 30px 24px;
        border-radius: 26px;
        border: 1px solid ${t.cardBorder};
        background: ${t.cardBg};
        box-shadow: ${isBold ? "inset 0 0 0 1px rgba(255,255,255,0.04), 0 20px 48px rgba(0,0,0,0.34)" : "0 12px 32px rgba(0,0,0,0.06)"};
        text-align: center;
    }

    .${prefix}-offer-card::before {
        content: "";
        position: absolute;
        top: 0; left: 50%;
        width: 72%; height: 4px;
        background: var(--${prefix}-primary);
        transform: translateX(-50%);
        ${isBold ? `box-shadow: 0 0 22px ${hexToRgba(colours.primary, 0.8)};` : ""}
    }

    .${prefix}-offer-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px; height: 48px;
        margin: 0 auto 18px;
        border-radius: 50%;
        background: var(--${prefix}-primary);
        color: #fff;
        font-size: 22px;
        font-weight: 950;
    }

    .${prefix}-offer-card h4 {
        margin: 0 0 12px;
        color: ${t.cardText};
        font-size: clamp(24px, 2.6vw, 34px);
        line-height: 0.98;
        font-weight: 950;
        letter-spacing: -0.045em;
        text-transform: uppercase;
    }

    .${prefix}-offer-card p {
        max-width: 320px;
        margin: 0 auto;
        color: ${isBold ? "var(--" + prefix + "-grey)" : "#555555"};
        font-size: 16px;
        line-height: 1.45;
    }

    .${prefix}-finance-teaser {
        margin: 26px auto 0;
        padding: 26px 24px;
        border-radius: 24px;
        border: 1px dashed var(--${prefix}-primary);
        background: ${isBold ? hexToRgba(colours.primary, 0.08) : hexToRgba(colours.primary, 0.05)};
        text-align: center;
    }

    .${prefix}-finance-teaser strong {
        display: block;
        color: var(--${prefix}-primary);
        font-size: 28px;
        font-weight: 950;
        margin-bottom: 6px;
    }

    .${prefix}-finance-teaser p { margin: 0; color: ${t.mutedText}; font-size: 15px; }

    .${prefix}-ending-panel {
        margin: 38px auto 0;
        padding: 32px 28px;
        border-radius: 26px;
        background: ${t.sectionBg};
        border: 1px solid ${t.sectionBorder};
        color: ${t.heroH1Color};
        text-align: center;
        ${t.sectionBackdrop}
    }

    .${prefix}-ending-panel h3 {
        margin: 0 0 10px;
        font-size: clamp(34px, 4.5vw, 58px);
        font-weight: 950;
        letter-spacing: -0.055em;
        text-transform: uppercase;
    }

    .${prefix}-ending-panel p { max-width: 820px; margin: 0 auto; color: ${t.mutedText}; font-size: 18px; line-height: 1.55; }

    .${prefix}-stock-section {
        position: relative;
        margin: 42px auto 0;
        padding: 38px 28px 72px;
        border-radius: 30px;
        background: ${t.sectionBg};
        border: 1px solid ${t.sectionBorder};
        color: ${t.heroH1Color};
        text-align: center;
        overflow: hidden;
        ${t.sectionBackdrop}
    }

    .${prefix}-stock-section h3 {
        margin: 0 0 8px;
        font-size: clamp(28px, 3.4vw, 48px);
        font-weight: 950;
        letter-spacing: -0.04em;
        text-transform: uppercase;
    }

    .${prefix}-stock-section p { max-width: 720px; margin: 0 auto 24px; color: ${t.mutedText}; font-size: 18px; line-height: 1.5; }

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

    .${prefix}-stock-section .vehicle-card,
    .${prefix}-stock-section .card,
    .${prefix}-stock-section article {
        overflow: hidden;
        background: #fff !important;
        color: #111 !important;
    }

    .${prefix}-stock-section .price,
    .${prefix}-stock-section [class*="price"] {
        color: var(--${prefix}-primary) !important;
        font-weight: 750 !important;
    }

    .${prefix}-tcs {
        max-width: 1000px;
        margin: 54px auto 0;
        padding: 30px 28px;
        border-radius: 24px;
        background: ${isBold ? "rgba(255,255,255,0.06)" : "#f7f7f6"};
        border: 1px solid ${t.sectionBorder};
        color: ${t.mutedText};
        text-align: center;
    }

    .${prefix}-tcs h4 {
        margin: 0 0 14px;
        color: ${t.heroH1Color};
        font-size: 20px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .${prefix}-tcs ul { list-style-position: inside; margin: 0; padding: 0; }
    .${prefix}-tcs li { margin: 0 0 8px; font-size: 12px; line-height: 1.6; }
    .${prefix}-tcs li:last-child { margin-bottom: 0; }

    .${prefix}-tcs details { text-align: left; margin: 0 0 8px; }
    .${prefix}-tcs summary { cursor: pointer; font-weight: 700; color: ${t.heroH1Color}; margin-bottom: 8px; }

    @media (max-width: 980px) {
        .${prefix}-offer-card { min-height: auto; }
    }

    @media (max-width: 900px) {
        .${prefix}-wrapper { padding: 64px 0 52px; }
        .${prefix}-stock-section { padding: 32px 18px 72px; }
    }

    @media (max-width: 600px) {
        .${prefix}-wrapper { width: min(100% - 24px, 1180px); }
        .${prefix}-hero-brand { font-size: 30px; }
        .${prefix}-hero h1 { font-size: clamp(58px, 20vw, 92px); }
        .${prefix}-hero h2 { font-size: clamp(34px, 12vw, 52px); }
        .${prefix}-date-banner { padding: 14px 22px; font-size: 25px; }
        .${prefix}-cta-row { flex-direction: column; }
        .${prefix}-btn { width: 100%; }
        .${prefix}-offer-panel { padding: 34px 18px; border-radius: 26px; }
        .${prefix}-stock-section { padding-bottom: 78px; }
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
          const query = buildStockQuery(row.conditions, state.brandName, row.models);
          return `
        <div class="${prefix}-stock-section">
            <h3>${escapeHtml(row.heading)}</h3>
            <p>${escapeHtml(row.intro)}</p>
            <div class="featcars embla" id="${prefix}-stock-${i + 1}" data-path="stock" data-query="${query}" data-limit="${row.limit}" data-layout="" data-dots="true" data-arrows="true"></div>
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

  return `<section class="${prefix}-page">
    <div class="${prefix}-wrapper">

        <div class="${prefix}-event-pill">${escapeHtml(state.eventPill)}</div>
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

        <div class="${prefix}-offer-panel">
            <h3>${escapeHtml(state.offerHeading)}</h3>
            <p class="${prefix}-offer-intro">${escapeHtml(state.offerIntro)}</p>
            <div class="${prefix}-offer-grid">${offerCards}
            </div>${financeHtml}
        </div>
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
