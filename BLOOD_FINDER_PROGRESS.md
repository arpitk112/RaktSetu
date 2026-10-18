# Blood Finder India: Build Plan & Progress Tracker

> **Give this file to your AI agent as the first message.** The agent must follow the "Agent Working Rules" below for the whole project.

---

## 0. Agent Working Rules (READ FIRST, FOLLOW STRICTLY)

You are building this project **one feature at a time** with a non-expert owner. After **every** feature:

1. **Stop coding.**
2. **Explain in simple language** (no jargon, or explain the jargon):
   - What you built
   - Which files you created or changed, and what each does
   - How it works step by step
   - How I can test it myself (exact commands or clicks)
3. **Ask me clearly:** *"Do you want to proceed to the next feature, or change something in this one?"*
4. **Wait for my reply.** Do not start the next feature until I answer.
5. If I ask for changes, make them, re-explain what changed, and ask again.
6. After I approve, tick the checkbox in the **Progress Tracker** (Section 3) and move on.

Other rules:
- Keep it simple. No unnecessary fields, animations, stock thumbnails or marketing fluff.
- Do not add features I did not ask for. Suggest them at the end instead.
- Never hard-code secrets (API keys, tokens). Use environment variables and a `.env.example` file.
- If something is unclear or I need to make a decision (for example, which paid service to use), ask me before assuming.

---

## 1. Project Summary

**Problem:** In India, people who urgently need blood waste critical time calling around blood banks and asking on social media.

**Solution:** A fast, mobile-first website with **two paths**:

1. **I need blood**: enter minimal details, see nearby blood banks. If banks are too far or have no stock, one button finds **willing donors nearby**.
2. **I want to donate**: register as a donor (with consent) so people in need can reach me.

**Key differentiating feature:** Before any donor's contact card is shown to a patient's family, the donor first receives a **WhatsApp message asking "Are you available to donate?"**. Only donors who reply **YES** appear as cards (name, phone, WhatsApp button).

**Site name:** **RaktSetu** ("rakt" = blood, "setu" = bridge: a bridge between people who need blood and people who can give it). Write it as one word with a capital R and S.

**Tagline:** **Find blood. Fast.** (Hindi version for later: *रक्त चाहिए? अभी खोजें।*)

Use the name in the header, page titles and footer, and the tagline under the main heading on the homepage. Keep both in one config/translations file so they are easy to change later. Do not add a logo image; use the name as plain red text.

---

## 2. Design & UX Principles

- **Theme:** Red and white only. Red for primary actions and urgency, white backgrounds, dark gray text. No gradients, no stock photos, no decorative thumbnails.
- **Mobile first and fully responsive.** Most users will be on phones, often in stress and on slow networks.
- **Large tap targets** (min 48px), high contrast, readable font size (min 16px).
- **Two big, clear cards on the homepage:**
  - 🔴 **"I need blood"** (solid red card, white text, most prominent)
  - ⚪ **"I want to donate blood"** (white card, red border and text)
- **Minimal forms:** only the fields needed. Inline validation, clear error messages.
- **Fast:** light pages, minimal JavaScript, works on 3G.
- **Languages:** English first. Keep all text in a translations file so Hindi/Punjabi etc. can be added later.
- **Accessibility:** proper labels, keyboard navigation, color contrast of at least 4.5:1.
- **Emergency note** (small text on the results page): *"For a life-threatening emergency, call 112 or go to the nearest hospital."*

---

## 2.0 BUDGET RULE: EVERYTHING MUST BE FREE

This is a project website with **zero budget**. The agent must:

- Use **only free tiers or free/open-source tools**. Never add a paid service, a service that needs a credit card, or a "free trial" that expires.
- If a feature **cannot** be done 100% free, **say so clearly before building it**, explain the cheapest free alternative, and let the owner decide.
- Watch free-tier limits (requests, storage, sleep/pause rules) and tell the owner about them.
- Design with a **swappable "notification channel"** (Feature 8) so a paid channel such as WhatsApp automation can be switched on later without rewriting the app.

## 2.1 Free Tech Stack (agent: confirm with owner before starting)

| Part | Free choice | Free-tier notes the agent must explain |
|---|---|---|
| Frontend + backend | **Next.js (App Router) + TypeScript** | Open source |
| Styling | **Tailwind CSS** | Open source |
| Database | **Supabase free plan (PostgreSQL + PostGIS)** | Free projects **pause after about a week of no activity**; add a free keep-alive ping (GitHub Actions cron or cron-job.org). Storage and bandwidth are limited. |
| Maps / location | **Leaflet + OpenStreetMap** for maps; **Nominatim or Photon (OSM-based)** for geocoding | Public Nominatim has a strict usage policy (about 1 request/sec, **no search-as-you-type autocomplete**, attribution required). Search on button press, or use a free-tier geocoder and check its limits. |
| Blood bank data | **OpenStreetMap (Overpass API)** blood bank / blood donation tags + public government lists (e.g. e-RaktKosh) imported once into our own table | One-time import, then no API calls per user. Data may be incomplete, so the UI says "call to confirm". |
| Donor messaging | **Telegram Bot API (100% free)** for the MVP; WhatsApp automation is optional and **not free** (see 2.2) | Donor must press "Start" on the bot once. Telegram is free with no per-message cost. |
| WhatsApp contact buttons | `wa.me` links and `tel:` links | Completely free (they just open the user's own app) |
| Phone verification | Verify the donor's number by having them **message our bot/number** (see Feature 6) instead of paid SMS OTP | Paid SMS OTP in India is not free; avoid it |
| CAPTCHA | **Cloudflare Turnstile** | Free |
| Rate limiting | A small table in Supabase, or Upstash Redis free tier | Free |
| Hosting | **Vercel Hobby plan** | Free; has function time and bandwidth limits |
| Domain | Free `*.vercel.app` subdomain | A custom domain costs money, so skip it for now |

---

## 2.2 Important Real-World Constraints (agent: explain these to the owner at the relevant feature)

1. **Automatic WhatsApp messages are NOT free.** Messages sent *first* to a donor must use a **pre-approved template** from a registered business number with Meta, and since July 2025 Meta charges **per delivered template message** (in India roughly under ₹1 per message depending on category, and rates change quarterly). Free-form WhatsApp replies are free only inside a 24-hour window that opens when the *donor* messages us first, which is not practical for standing donors. The "unofficial" WhatsApp libraries (e.g. whatsapp-web.js, Baileys) are free but **break WhatsApp's terms and can get the number banned**, so the agent must not use them. **Free route:** send the availability question through a **Telegram bot**, and keep the WhatsApp button on the donor card (that part is free). **Paid-later route:** switch the same flow to WhatsApp Cloud API when the owner has a few hundred rupees and a Meta Business account. Replies ("YES"/"NO") arrive through a **webhook** that the app must expose in both cases.
2. **Consent is required.** Donors must explicitly agree during registration to (a) be contacted on WhatsApp and (b) have their name and phone shared with people in need **after** they confirm availability.
3. **Privacy:** Donor phone numbers must never appear in public listings or be visible before the donor confirms. Show only **after a YES**, and only for a limited time window.
4. **Abuse prevention:** rate-limit requests, add a CAPTCHA to the "I need blood" form, and block repeated searches from the same device or number.
5. **Blood bank data accuracy:** There is no single free, real-time stock API for all of India. The site should show **location and contact info** and tell users to **call to confirm stock**. Be honest in the UI about this.
6. **Legal/safety note:** The site connects people. It does not verify medical suitability. Add a short disclaimer.

---

## 3. Progress Tracker

Tick a box **only after the owner approves** that feature.

- [x] **Feature 1:** Project setup & red/white design system
- [x] **Feature 2:** Homepage with two user paths
- [x] **Feature 3:** "I need blood" request form
- [x] **Feature 4:** Location input (GPS + search)
- [x] **Feature 5:** Nearby blood banks results
- [x] **Feature 6:** Donor registration with consent and OTP
- [x] **Feature 7:** "Find donors nearby" button & donor matching
- [x] **Feature 8:** WhatsApp availability check (send message)
- [x] **Feature 9:** WhatsApp reply handling (webhook)
- [x] **Feature 10:** Live donor cards (name, call, WhatsApp)
- [x] **Feature 11:** Safety, privacy & abuse protection
- [x] **Feature 12:** Polish, testing & deployment

---

## 4. Features: Step by Step

> For every feature, the agent must end with the **Checkpoint** from Section 0.

---

### Feature 1: Project setup & red/white design system

**Goal:** A clean, running empty project with the theme ready.

**Tasks**
1. Create the Next.js + TypeScript + Tailwind project.
2. Define theme colors in config: primary red (e.g. `#D32F2F`), dark red for hover (`#B71C1C`), white, light gray background (`#FAFAFA`), text (`#212121`).
3. Create reusable components: `Button` (primary red, secondary outlined), `Card`, `Input`, `Select`, `Header`, `Footer`.
4. Set up folder structure, `.env.example`, and a README with run instructions.
5. Add a simple translations file for all UI text.

**Done when:** `npm run dev` shows a blank styled page; components render correctly on mobile and desktop.

**Checkpoint:** Explain the folder structure and how to run the project. Ask to proceed.

---

### Feature 2: Homepage with two user paths

**Goal:** A very simple, urgent-friendly front page.

**Layout (top to bottom)**
1. Slim header: site name/logo (text only) + small language placeholder.
2. Tagline (one line) and one short supporting sentence.
3. **Two large cards**, stacked on mobile, side by side on desktop:
   - 🔴 **I need blood**: solid red background, white text, short line: *"Find nearby blood banks and donors"*. Button: **Find Blood**.
   - ⚪ **I want to donate**: white background, red border: *"Register to help someone in need"*. Button: **Become a Donor**.
4. Small 3-step "How it works" strip (text only, no images).
5. Footer: disclaimer, emergency number note (112), contact.

**Rules:** No images, no sliders, no pop-ups. Page must load fast.

**Done when:** Both cards link to their routes (`/need-blood`, `/donate`), and the layout is responsive from 320px up.

---

### Feature 3: "I need blood" request form

**Goal:** Collect only the essential details, fast.

**Fields (nothing more)**
| Field | Type | Notes |
|---|---|---|
| Patient name | text | required |
| Patient age | number | required, 0–120 |
| Blood group | select | A+, A−, B+, B−, AB+, AB−, O+, O− (required) |
| Location | location input (Feature 4) | required |
| Your phone number | tel | required, so donors can reach the requester |

**Tasks**
1. Build the form with inline validation.
2. Validate Indian mobile numbers (10 digits, starts 6–9; accept +91).
3. Store the request in a `blood_requests` table (id, patient_name, age, blood_group, lat, lng, address, requester_phone, status, created_at).
4. On submit, go to the results page (Feature 5).

**Done when:** A valid submission is saved and redirects; invalid input shows clear messages.

---

### Feature 4: Location input (GPS + search)

**Goal:** Get a reliable location quickly.

**Tasks**
1. Button: **"Use my current location"** (browser geolocation). Handle permission denied gracefully.
2. Text search box with address/area/city/hospital autocomplete (India-restricted).
3. Reverse-geocode GPS coordinates into a readable address for confirmation.
4. Let the user confirm or edit the location before continuing.
5. Save latitude, longitude and address.

**Done when:** Both GPS and typed search give a confirmed lat/lng on mobile and desktop.

---

### Feature 5: Nearby blood banks results

**Goal:** Show blood banks near the patient, nearest first.

**Tasks**
1. Create a `blood_banks` table (name, address, phone, lat, lng, city, state, source, last_verified).
2. Seed it with publicly available data (agent: use only free sources, namely OpenStreetMap Overpass data and public government lists such as e-RaktKosh, imported once into our own table via a script; explain the data's limits to the owner and do not use Google Places).
3. Query banks within a radius (start 25 km, expandable) sorted by distance using PostGIS.
4. Show each bank as a simple card: **name, distance, address, [Call] button, [Directions] button (opens Google Maps)**.
5. Add a clear notice: *"Stock changes quickly. Please call to confirm availability."*
6. **Always show a prominent red button at the top and bottom of the results:** **"Can't find blood? Find donors nearby"** (works even if there are zero banks, or banks are far or call-unreachable).
7. Empty state: *"No blood banks found nearby."* + the same donor button.

**Done when:** Results appear sorted by distance, the Call button dials, and the donor button is visible in every state.

---

### Feature 6: Donor registration with consent and OTP

**Goal:** Let people sign up as donors, safely and with consent.

**Fields**
| Field | Notes |
|---|---|
| Name | required |
| Age | required, 18–65 |
| Blood group | required |
| Location | via Feature 4 (area-level is enough) |
| WhatsApp/phone number | required, verified by OTP |
| Last donation date | optional (used to hide donors who donated under 3 months ago) |
| **Consent checkboxes** | (1) "I agree to receive WhatsApp messages asking if I can donate." (2) "I agree to share my name and phone number with a person in need **only after I confirm** I am available." Both required. |

**Tasks**
1. Build the form and the `donors` table (id, name, age, blood_group, lat, lng, phone, phone_verified, consent_whatsapp, consent_share, last_donated_at, is_active, created_at).
2. **Free phone verification (no paid SMS OTP).** After the form, show a button **"Connect Telegram"** that opens our bot with a one-time code. The donor presses Start and shares their phone number using Telegram's built-in "Share contact" button. The bot checks it matches the number entered in the form, then marks the donor `phone_verified` and stores their Telegram chat id for later messages. Agent: explain to the owner why this replaces SMS OTP and that Telegram becomes the channel donors are asked on.
3. Prevent duplicate registrations by phone number.
4. Give donors an easy way to **pause or delete** their profile (simple link sent via WhatsApp, or a "manage my profile" page after OTP login).
5. Success screen: a thank-you and a short eligibility note (age, weight, health). No medical claims.

**Done when:** A donor can register, verify OTP, and appears in the database as active with consent recorded.

---

### Feature 7: "Find donors nearby" button & donor matching

**Goal:** Find eligible donors around the patient.

**Tasks**
1. Clicking **"Find donors nearby"** creates a `donor_search` record linked to the blood request.
2. Query donors where: same or compatible blood group, `is_active`, `phone_verified`, both consents true, within radius (start 10 km, expand to 25/50 km), and not recently donated.
3. Use **blood group compatibility** (for example, O− can donate to all; patient AB+ can receive from any). Agent: explain the compatibility rules to the owner in plain language and ask whether to include compatible groups or exact match only.
4. Limit to the nearest N donors per round (suggest 10–15) to avoid spamming people.
5. **Do not show any donor details yet.** Show a waiting screen: *"We're asking nearby donors if they're available. Responses will appear here."*

**Done when:** The matching query returns the right donors for test data, and no donor info is exposed to the requester.

---

### Feature 8: WhatsApp availability check (send message)

**Goal:** Ask each matched donor on WhatsApp whether they can donate.

**Tasks**
1. **Build a swappable `NotificationChannel` interface** with a `sendAvailabilityCheck(donor, request)` function and implement it first for **Telegram** (free): create the bot with @BotFather, keep the bot token in env variables, and send the message with **inline "Yes / No" buttons**. Leave a second, **disabled** `WhatsAppChannel` implementation as a stub for later. **Decision made by owner: Telegram only (free).** Do not ask again; keep the WhatsApp channel as a disabled stub for a possible paid upgrade later. Never use unofficial WhatsApp libraries.
2. Create and submit one **approved message template**, for example:
   > "🩸 Urgent: Someone near **{{area}}** needs **{{blood_group}}** blood. Are you available to donate? Reply **YES** or **NO**. If YES, your name and phone number will be shared with the person in need."
   Include quick-reply buttons **Yes / No** if supported.
3. Do **not** include the patient's name or the requester's phone in this message.
4. Send messages to the matched donors and record each in a `donor_requests` table (id, search_id, donor_id, status: `sent | yes | no | no_response | failed`, sent_at, responded_at).
5. Handle send failures and retries, and respect rate limits.
6. Never message the same donor more than once per X hours (suggest 12 hours) across all requests.

**Done when:** A test donor (the owner's own number) receives the WhatsApp message and the status is stored as `sent`.

---

### Feature 9: WhatsApp reply handling (webhook)

**Goal:** Capture donor replies automatically.

**Tasks**
1. Create a secure webhook endpoint for the chosen channel (Telegram: verify the secret token header; WhatsApp later: verify the Meta signature).
2. Parse replies and button taps: YES / NO (accept variations like "yes", "ha", "haan", "no", "nahi").
3. Update `donor_requests.status` to `yes` or `no` and set `responded_at`.
4. Send a short acknowledgement:
   - YES: *"Thank you! Your details are being shared with the person in need. Please stay reachable."*
   - NO: *"No problem, thank you for replying."*
5. Add a **STOP** keyword that pauses the donor's profile and confirms.
6. Expire un-answered requests after a time limit (suggest 30 minutes, mark `no_response`).

**Done when:** Replying YES or NO from the owner's phone updates the database in real time.

---

### Feature 10: Live donor cards (name, call, WhatsApp)

**Goal:** Show only confirmed donors, appearing live.

**Tasks**
1. On the waiting page, use polling (every 5s) or Supabase Realtime to watch `donor_requests` for `yes`.
2. When a donor says YES, a **card pops in** with a gentle animation:
   - **Name**, blood group, approximate distance (for example, "~3 km away")
   - **Phone number**
   - 📞 **Call** button (`tel:` link)
   - 💬 **WhatsApp** button (`https://wa.me/91XXXXXXXXXX?text=...` with a prefilled message such as *"Hello, I found you on {SiteName}. I need {blood_group} blood urgently."*)
3. Show a live status line: *"5 donors asked · 2 available · 1 waiting"*. Do **not** show names of people who said NO or did not reply.
4. Add a **"Ask more donors"** button that widens the radius and runs another round.
5. Cards disappear after a time limit (suggest 24 hours) and the search is marked closed.
6. Add a **"Mark as found"** button so the requester can close the search, and notify the remaining pending donors that it is no longer needed.

**Done when:** A YES reply makes a card appear within seconds, with working Call and WhatsApp buttons, and NO replies never appear.

---

### Feature 11: Safety, privacy & abuse protection

**Tasks**
1. Rate limiting on all public endpoints (requests, OTP, searches).
2. CAPTCHA (for example Cloudflare Turnstile) on the "I need blood" submit.
3. Limit searches per phone number and per IP per day.
4. Row-level security in the database so donor phone numbers can only be read through the server after a YES.
5. Store only what is needed. Add a privacy policy and terms page (short, plain language), including how to delete data.
6. Add a **"Report this request"** option for donors in the WhatsApp flow (or a link) to flag fake or abusive requests.
7. Log errors without logging phone numbers in plain text.

**Done when:** The owner can try to spam the form and gets blocked, and donor numbers are verifiably not exposed before consent.

---

### Feature 12: Polish, testing & deployment

**Tasks**
1. Test on real phones (small Android, iPhone) and slow network settings.
2. Run Lighthouse and fix performance and accessibility issues (target 90+).
3. Test the whole flow end to end: need blood → banks → find donors → WhatsApp → YES → card.
4. Test edge cases: no banks, no donors, GPS denied, duplicate donor, STOP reply, expired search.
5. Add basic analytics (privacy-friendly) to see usage counts only.
6. Deploy on the **free** Vercel Hobby plan and Supabase free plan using the free `*.vercel.app` address (HTTPS included), set production environment variables, and add the free keep-alive ping so the Supabase project does not pause.
7. Write a short owner guide: how to add blood banks, view requests, and update the WhatsApp template.

**Done when:** The site is live, the full flow works with real phone numbers, and the owner signs off.

---

## 5. Data Model (reference)

```
blood_requests ( id, patient_name, age, blood_group, lat, lng, address,
                 requester_phone, status[open|closed], created_at )

blood_banks    ( id, name, address, phone, lat, lng, city, state,
                 source, last_verified )

donors         ( id, name, age, blood_group, lat, lng, phone,
                 phone_verified, consent_whatsapp, consent_share,
                 last_donated_at, is_active, created_at )

donor_searches ( id, request_id, radius_km, round, created_at )

donor_requests ( id, search_id, donor_id,
                 status[sent|yes|no|no_response|failed],
                 sent_at, responded_at )
```

---

## 6. Core Flow (reference)

```
Home ─► "I need blood" ─► Form (name, age, group, location, phone)
                              │
                              ▼
                    Nearby blood banks list
                              │
              [Find donors nearby] (always visible)
                              │
                              ▼
          Match donors (group + radius + consent)
                              │
                              ▼
        WhatsApp to donors: "Available? YES / NO"
                              │
                 ┌────────────┴────────────┐
               NO / no reply              YES
             (nothing shown)               │
                                           ▼
                        Donor card appears live:
                    Name · Phone · Call · WhatsApp
```

---

## 7. Future Ideas (do NOT build unless the owner asks)

- Hindi, Punjabi and other language support
- Hospital partnerships and verified blood bank stock updates
- Donor reminders after 3 months, donation history
- SMS fallback if WhatsApp fails
- Plasma and platelet requests
- Admin dashboard

---

## 8. First Message the Agent Should Send

> "I've read the plan. Everything must stay free, so I'll use Next.js + Tailwind + Supabase free plan + Vercel free plan, and a free Telegram bot for asking donors if they're available (automatic WhatsApp messages cost money per message, so I'll keep that as an optional upgrade for later). The owner has already approved Telegram, the name **RaktSetu** and the tagline **Find blood. Fast.**, so I have nothing left to ask before starting. Once you answer, I'll begin **Feature 1** and explain everything when it's done."
