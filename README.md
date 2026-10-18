# RaktSetu (रक्तसेतु)

> **Find blood. Fast.**  
> A fast, mobile-first website for India to find nearby blood banks first, then reach verified willing donors who confirm their availability.

---

## 🛠️ Free Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Pure Red/White Design Tokens
- **Typography**: Public Sans (Google Fonts)
- **Database**: Supabase Free Plan (PostgreSQL + PostGIS)
- **Donor Messaging**: Telegram Bot API (100% Free)
- **Deployment**: Vercel Hobby Plan (100% Free)

---

## 🚀 How to Run Locally Right Now (Zero Setup Required)

The application includes built-in in-memory stores and simulation tools so you can test the **entire system end-to-end immediately without signing up for external services**:

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⚙️ Manual Setup Guide for Production / Live Cloud

When you are ready to connect live external cloud services (all 100% free), follow these simple steps:

### 1. Telegram Bot (Free Donor Messaging & Verification)
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to choose a bot name (e.g. `RaktSetu India`) and username (e.g. `RaktSetuBot`).
3. BotFather will provide an **HTTP API Token** (e.g. `718293847:AAHxyz...`).
4. Copy `.env.example` to `.env.local` and paste:
   ```env
   TELEGRAM_BOT_TOKEN=your_token_from_botfather
   TELEGRAM_BOT_USERNAME=your_bot_username
   ```
5. Set the webhook URL (after deploying to Vercel):
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook
   ```

### 2. Supabase Free Database (PostgreSQL + PostGIS)
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. In the Supabase dashboard, go to the **SQL Editor**.
3. Copy the entire contents of [`supabase/schema.sql`](file:///d:/RaktSetu/supabase/schema.sql) and click **Run**.
4. In **Project Settings** &rarr; **API**, copy:
   - **Project URL** &rarr; `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** &rarr; `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** &rarr; `SUPABASE_SERVICE_ROLE_KEY`
5. Paste these into your `.env.local` or Vercel Environment Variables.

### 3. Deploy to Vercel (Free Hobby Plan)
1. Push your repository to GitHub.
2. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
3. Import the `RaktSetu` repository.
4. Add the environment variables from `.env.example` under **Environment Variables**.
5. Click **Deploy**. Your app will be live at `https://your-project.vercel.app`.

---

## 📁 Project Architecture & Routes

```
d:/RaktSetu
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Homepage with two user paths (Feature 2)
│   │   ├── need-blood/page.tsx      # "I need blood" request form (Feature 3 & 4)
│   │   ├── results/[id]/page.tsx    # Nearby blood banks results & donor trigger (Feature 5)
│   │   ├── donate/page.tsx          # Donor registration & Telegram OTP (Feature 6)
│   │   ├── donate/manage/page.tsx   # Donor self-service profile management
│   │   ├── donors/[searchId]/page.tsx # Live incoming donor cards & status (Feature 7, 8, 9, 10)
│   │   ├── privacy/page.tsx         # Privacy policy
│   │   └── api/
│   │       ├── blood-banks/         # Distance-sorted blood bank search
│   │       ├── blood-requests/      # Blood request creation & retrieval
│   │       ├── donor-requests/      # Live donor outreach polling & privacy filter
│   │       ├── donor-searches/      # Donor matching & radius expansion
│   │       ├── donors/              # Registration, OTP verification & management
│   │       ├── geocode/             # Free OSM Photon search & reverse geocoding
│   │       ├── telegram/            # Bot webhook & instant reply simulation
│   │       └── report-request/      # Abuse & spam reporting
│   ├── components/                  # Design tokens, Button, Card, Input, Select, LocationInput
│   ├── lib/                         # Blood compatibility, database fallback, notifications
│   └── data/                        # Seed data for verified Indian blood banks
├── supabase/schema.sql              # Supabase tables and PostGIS spatial indexes
└── BLOOD_FINDER_PROGRESS.md         # 12-Feature Roadmap & Progress Tracker
```
