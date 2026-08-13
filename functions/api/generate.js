// @ts-nocheck
/*
 * Cloudflare Pages Function — same-origin AI endpoint at
 * /api/generate on showroom.sortedstudios.com.au. Because it's served
 * from the same hostname as the app (not a separate *.workers.dev URL),
 * it automatically sits behind the same Cloudflare Access login wall —
 * no separate exposed endpoint, no CORS needed, nothing for a customer
 * to see or copy.
 *
 * Deploy: this file just needs to exist in functions/api/generate.js in
 * the repo — Cloudflare Pages picks it up automatically on the next
 * deploy. You still need to add the Workers AI binding once, on the
 * Pages project itself: Pages project -> Settings -> Functions ->
 * Bindings -> Add -> Workers AI -> name it "AI".
 */

const SYSTEM_PROMPT = `You are a copywriting assistant for an Australian car dealership landing-page tool.

Given a short campaign brief from a marketing manager, output a SINGLE raw JSON object (no markdown fences, no commentary) matching exactly this shape:

{
  "brandName": string,        // the manufacturer brand only, e.g. "Hyundai", "Mazda", "Kia" — not the dealership name
  "dealershipName": string,   // e.g. "Melville Hyundai"
  "suburb": string,           // e.g. "Melville" — the suburb only, no state/postcode
  "heroBrandLine": string,    // short line above the headline, usually the dealership name
  "heading": string,          // the big headline, punchy, matches the offer
  "subheading": string,       // supporting line under the headline
  "paragraph": string,        // 1-2 sentence hero paragraph expanding on the offer
  "urgencyText": string,      // short urgency phrase e.g. "Limited Time Only", or "" if nothing implies urgency
  "dateBannerText": string,   // e.g. "Ends 31 August" if an end date was given, else ""
  "ctaPrimaryText": string,   // short button label, e.g. "View Eligible Stock"
  "offerHeading": string,     // heading for the offer-cards panel
  "offerIntro": string,       // one sentence intro for that panel
  "offers": [ { "title": string, "description": string } ],  // exactly 3 plausible offer cards related to the brief
  "stockHeading": string,     // heading for the stock slider section
  "stockIntro": string,       // one sentence intro for the stock slider
  "stockConditions": [string],// subset of ["New","Demo","Used"] implied by the brief; default ["New"] if unclear
  "stockModels": [string],    // specific model names ONLY if the brief names them, else []
  "endingHeading": string,    // closing panel heading
  "endingText": string,       // closing panel sentence
  "tcsItems": [string]        // 3-5 plausible, generic terms & conditions bullet points for this kind of offer
}

Rules:
- Output ONLY the JSON object. No markdown code fences, no explanation before or after.
- Fill in anything not explicitly stated with plausible, brand-appropriate dealership marketing copy — never leave a field empty unless the schema says it can be "" or [].
- Keep copy Australian in spelling and tone (e.g. "enquire" not "inquire").
- Keep it punchy and dealership-appropriate: short sentences, no corporate fluff.`;

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let brief;
  try {
    const body = await request.json();
    brief = (body.brief || "").trim();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  if (brief.length < 5) {
    return json({ error: "Give a slightly longer campaign description." }, 400);
  }
  if (brief.length > 500) {
    return json({ error: "Keep the campaign description under 500 characters." }, 400);
  }

  try {
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: brief },
      ],
      temperature: 0.4,
    });

    const raw = (result.response || "").trim();
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return json({ error: "Couldn't understand that response — try rephrasing your brief." }, 502);
    }

    return json(data, 200);
  } catch (err) {
    return json({ error: "AI generation failed. Try again in a moment." }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
