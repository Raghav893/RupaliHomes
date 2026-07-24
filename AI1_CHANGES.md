# Rupali Homes — Frontend Changes (AI-1 / "Global Chrome, Accounts & Conversion")

This document covers the work done on the **AI-1 half** of the split feature list.
Two assistants worked the same codebase in parallel; ownership was divided by file so
nothing overlaps. AI-2 owns Sell, About Us, and the Instagram/social feed — none of
those files are touched here.

All changes are in `frontend/`. Verified with `npx tsc --noEmit` (zero errors).

---

## Priority-list items delivered

| # | Area | Item | Status |
|---|------|------|--------|
| 1 | Navbar | Wishlist heart shows a **live counter including "0"** | ✅ |
| 3 | Hero | **BHK configuration** filter alongside price | ✅ |
| 2 | Navbar | **Login / Signup + account system** (profile, saved properties, enquiry history) | ✅ |
| 8 | Finance | Dedicated **Home Loans / Finance page** with EMI calculator | ✅ |
| 13 | Social Proof | **WhatsApp one-tap** business chat | ✅ |
| 14 | Contact | **Always-available Contact** sitewide | ✅ |
| — | Footer | Region rename to Southern Peripheral / Dwarka Expressway (+ Finance link) | ✅ |

---

## What changed, by feature

### 1 — Navbar wishlist live counter
`components/Navbar.tsx`
- The heart badge now **always renders**, showing `0` by default so it never looks
  broken. Fills red when there are saved items, neutral grey at zero.
- Applied to both the desktop bar and the mobile overlay.
- Still driven by the existing `likedPropertiesChanged` window event and
  `fetchLikedPropertyIds()` — no change to the like backend.

### 14 + 13 — Sitewide Contact & WhatsApp one-tap
`components/StickyCTA.tsx`, `app/layout.tsx`, `app/buy/page.tsx`
- `StickyCTA` is now mounted **once, globally, in the root layout**, so a contact
  action is reachable from every page (it was previously only on `/buy`).
- Rebuilt into a proper hub with four actions: **WhatsApp**, **Call**, **Enquire**
  (routes to `/#contact`), and **Instagram**.
- WhatsApp opens a chat with a **pre-filled business-query message** — true one-tap.
- Removed the now-duplicate `StickyCTA` from the buy page.

### 3 — Hero BHK + price filter
`components/HeroSearch.tsx`, `app/buy/page.tsx`, `app/rent/page.tsx`
- Added a **Configuration** dropdown (1 / 2 / 3 / 4 / 5+ BHK) next to Budget.
- On search it emits a `bedrooms` query param; the buy and rent pages now read that
  param and apply it to their existing bedroom filter.
- Hidden on the Plot and Commercial tabs where BHK is not relevant.

### 2 — Login / Signup account system
`context/AuthContext.tsx` (new), `app/account/login/page.tsx` (new),
`app/account/page.tsx` (new), `app/layout.tsx`, `components/Navbar.tsx`,
`components/Contact.tsx`
- **`AuthContext`** — a self-contained account system (signup, login, logout, profile
  edit, enquiry history). It is **localStorage-backed today** so the whole experience
  works without a public-user backend, and is deliberately isolated so it can be
  swapped for real API calls later without touching any UI.
- **`/account/login`** — combined Login / Sign-up screen with validation.
- **`/account`** — dashboard with three tabs:
  - **Saved Properties** — reuses `fetchLikedProperties()` (the existing like system).
  - **Enquiry History** — populated when a signed-in user submits the Contact form.
  - **Profile** — inline-editable name and phone.
  - Redirects to `/account/login` when signed out.
- **Navbar** shows an avatar (initial) when signed in, or a Login entry when not.
- **Contact form** records an enquiry to the user's history on successful submit.

> Note: the current auth is a client-side MVP (non-cryptographic) intended to be
> replaced by a real backend. It is not secure auth and should not be treated as such.

### 8 — Finance / Home Loans page
`app/finance/page.tsx` (new), `components/Navbar.tsx`, `components/Footer.tsx`
- New `/finance` route (no longer routed to Contact) with:
  - An **interactive EMI calculator** — loan amount / rate / tenure sliders with a
    live EMI figure and a principal-vs-interest breakdown.
  - Loan products, eligibility checklist, and lending-partner grid.
  - Call / WhatsApp / Enquire CTAs.
- Linked from the **navbar** (desktop + mobile, "Home Loans") and the **footer**.

### Footer region rename
`components/Footer.tsx`
- The "Top Localities" already lead with **Southern Peripheral** and
  **Dwarka Expressway** (the requested rename away from generic Gurgaon/Delhi).
- Added a **Home Loans & Finance** link to the Explore column.

---

## New files

```
frontend/src/lib/contact.ts              # single source of truth for phone/WhatsApp/email/socials
frontend/src/context/AuthContext.tsx     # client-side account system (swappable for a real API)
frontend/src/app/finance/page.tsx        # Home Loans page + EMI calculator
frontend/src/app/account/login/page.tsx  # login / signup
frontend/src/app/account/page.tsx        # account dashboard
```

## Files edited

```
frontend/src/app/layout.tsx              # AuthProvider + global StickyCTA
frontend/src/components/Navbar.tsx       # always-on counter, account entry, Finance link
frontend/src/components/Footer.tsx       # Finance link
frontend/src/components/StickyCTA.tsx    # full contact hub (WhatsApp/Call/Enquire/Instagram)
frontend/src/components/Contact.tsx      # log enquiry to signed-in user's history
frontend/src/components/HeroSearch.tsx   # Configuration (BHK) dropdown
frontend/src/app/buy/page.tsx            # read bedrooms param; drop duplicate StickyCTA
frontend/src/app/rent/page.tsx           # read bedrooms param
```

---

## Coordination notes (for AI-2)

- **Not touched** (AI-2's territory): `app/page.tsx`, `Testimonials`, `About`,
  `WhyChooseUs`, `InstagramReels`, `app/sell/*`, `app/about-us/*`, `app/api/*`.
- New contact helpers live in **`lib/contact.ts`**, not shared `lib/api.ts`, to avoid
  edit conflicts.
- One shared touchpoint to be aware of: the buy/rent pages now read a `bedrooms` URL
  param (from the hero Configuration filter).
