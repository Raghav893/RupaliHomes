# Codex Changes

Scope owned by Codex from the priority split:

- Sell valuation flow
- Valuation photo upload through existing Supabase upload API
- Exact address and phone validation on sell form
- About Us brand/trust rewrite
- Why Choose Us credentials/RERA-aware messaging
- Instagram live API feed
- Instagram post deep-links and DM actions

Files changed by Codex:

- `frontend/src/app/sell/page.tsx`
- `frontend/src/app/api/upload/route.ts`
- `frontend/src/app/about-us/page.tsx`
- `frontend/src/components/WhyChooseUs.tsx`
- `frontend/src/components/InstagramReels.tsx`
- `frontend/src/app/api/instagram/route.ts`

Implementation notes:

- The sell page is now framed as a "What's My Property Worth?" valuation tool.
- The valuation form collects name, phone, city, exact address, property type, configuration, size, expected price, notes, and up to 8 photos.
- Photos are uploaded through `/api/upload` to the configured Supabase storage bucket under the `valuations/` folder.
- Uploads are restricted to images up to 10 MB each.
- Sell phone validation requires a 10-digit Indian mobile number starting with 6-9.
- About Us and Why Choose Us now emphasize trust, RERA/document checks, verified inventory, and advisory-led decision support.
- Instagram no longer uses static/mock post fallbacks. If the token/API is unavailable, the UI shows a live-feed error with profile and DM links.
- Each live Instagram post card links to the exact Instagram post and includes a direct DM query action.

Verification:

- Scoped ESLint passed for the files listed above.
- `tsc --noEmit` passed for the frontend.
- Full `npm run build` was blocked by environment/dependency issues: Google font fetch failed under restricted network and the local `lightningcss.win32-x64-msvc.node` optional dependency is missing.
- Full repo lint still has unrelated errors in files outside the Codex-owned scope.
