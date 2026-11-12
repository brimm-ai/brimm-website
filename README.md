# brimm-website
brimm website

## Standing rule — every design change is approved first (founder, 30 Oct 2026 14:35)
ANY design change on brimm.ai, however tiny — images, spacing, alignment, line breaks, colours, wording placement — is shown to the
founder as a BEFORE and an AFTER and approved BEFORE it is published. Nothing visual is pushed to `main` (the live site) on its own say-so.
The guards in `.githooks/pre-commit` (no prices, no verdicts, no provider names) still run on every commit; they do not replace this.

## Record — 11 Nov 2026 evening (brimm Website build)
LIVE on `main`: visitor counter (Cloudflare Web Analytics, every page) + the privacy line dated 11 November 2026 (HQ #212, b351c76 via
web-analytics); Refunds & cancellation policy at /refunds.html and a "Refunds" footer link on every page (founder's OK, e933cb2). Guards
and Lighthouse checked before each.
BRANCHES, NOT live: `payments-pages` (dae483f, drafts for the payment applications, HQ mock #214 waiting); `web-checkout` (f80e0f5,
3357204, 6a2a514: Go Pro on #pricing + /pro, Paddle SANDBOX token only, HQ mock #215 waiting; PARKED after Paddle's live-account
rejection, appeal pending ~16 Nov). The Paddle SECRET key never comes near this repo (Supabase secrets only).
WAITING: HQ #213 visa chips — wired on a branch only once App build's server door exists.
