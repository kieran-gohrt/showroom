# /api/generate — AI campaign brief endpoint

This is a Cloudflare **Pages Function**, not a standalone Worker. It lives at
`functions/api/generate.js` and Cloudflare Pages automatically serves it at
`/api/generate` on your existing domain (`showroom.sortedstudios.com.au`) —
same origin as the rest of the app.

That matters for two reasons:
1. **No separate URL to expose.** The old approach used a standalone
   `*.workers.dev` Worker, which meant its URL sat outside your Cloudflare
   Access login wall — anyone who found it could call it directly. This
   version can't be reached without first passing Access, since it's served
   from the same protected hostname.
2. **No settings box needed.** The frontend just calls `/api/generate`
   directly (see `AI_ENDPOINT` in `js/main.js`) — nothing for a customer to
   configure or ever see.

## One-time setup

This deploys automatically with the rest of the site on every push — nothing
extra to do for that. The only manual step is adding the Workers AI binding
to the **Pages project itself** (not a separate Worker):

1. Cloudflare dashboard → your Pages project (the one serving
   `showroom.sortedstudios.com.au`) → **Settings** → **Functions**
2. **Bindings** → **Add** → **Workers AI** → name it exactly `AI`
3. Save, then trigger a redeploy if it doesn't pick it up immediately
   (Deployments tab → retry latest deployment)

If you previously created a standalone `showroom-ai` Worker for this, you can
delete it now — it's no longer used and was the insecure version of this
same feature.

## Cost

Workers AI has a free daily allocation that comfortably covers casual use.
Cloudflare will prompt for billing if you outgrow it rather than silently
failing.
