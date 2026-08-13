# AI campaign brief — Cloudflare Worker

Turns a one-line campaign description ("Melville Hyundai. $2000 cashback offer
across new and demo vehicles. Ends August 31st.") into structured landing-page
copy using **Workers AI** (Cloudflare's free-tier LLM inference).

No local tooling needed — deploy entirely from the Cloudflare dashboard.

## Deploy

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**
2. Give it a name, e.g. `showroom-ai` — this becomes part of the URL:
   `https://showroom-ai.<your-subdomain>.workers.dev`
3. Click **Deploy** to create it with the default template, then **Edit code**
4. Delete the placeholder code and paste in the full contents of `ai-worker.js`
   (same folder as this file)
5. Click **Deploy** again to publish your changes
6. Go to the Worker's **Settings** → **Bindings** → **Add binding** → **Workers AI**
   → name it exactly `AI` (the code reads `env.AI`) → Save
7. Copy the Worker's URL (shown at the top of its dashboard page, or under
   **Settings** → **Domains & Routes**) — it looks like
   `https://showroom-ai.your-subdomain.workers.dev`

## Connect it to Showroom

1. Open the Showroom app
2. In the **Describe your campaign** box at the top of the Landing Page tab,
   expand **AI endpoint settings**
3. Paste the Worker URL from step 7 above into **Worker URL** — it's saved in
   that browser only (`localStorage`), no redeploy needed if it changes later
4. Type a one-line brief and hit **Generate with AI** — it fills in the
   dealership, hero copy, offer cards, stock section and T&Cs, which you can
   then review/edit before hitting the regular **Generate landing page**
   button as normal

## Cost

Workers AI has a free daily allocation (Cloudflare's "neurons" quota) that
comfortably covers casual use. If usage grows a lot, Cloudflare will prompt
you to attach a billing method rather than silently failing.

## Notes

- The Worker validates and CORS-enables requests from any origin (`*`) since
  this is a small internal tool, not a public API — tighten
  `Access-Control-Allow-Origin` in `ai-worker.js` to your actual domain if you
  want to lock that down later.
- Model used: `@cf/meta/llama-3.1-8b-instruct`. Swap the model string in
  `ai-worker.js` if you want to try a different one available on Workers AI.
