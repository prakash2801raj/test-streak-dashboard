# Test Streak — Test Performance & Consistency Dashboard

A GitHub-streak-style dashboard for tracking test scores and study consistency.
No login screen — runs anonymously per-browser via Firebase Anonymous Auth, with
all data stored in Cloud Firestore.

## What's inside

- **Test entry** — name, type (Daily/Weekly/Custom), date, score, total, time taken, remarks. Percentage is auto-calculated.
- **Streak tracker** — pick a start date and cadence (daily / alternate days / weekly / custom interval). The cadence can be **changed later** without losing history — streaks are recalculated from the full timeline, not stored as a single counter.
- **Dashboard cards** — current streak, longest streak, total tests, average score, highest score, tests this month.
- **Charts** — score trend (line), subject-wise average (bar), monthly progress (bar). Built with Recharts.
- **Streak heatmap** — GitHub-style calendar grid, but cell brightness encodes *score%* on days you tested, and missed expected days render as a visible rust-red mark instead of a blank square.
- **Filters** — subject, test type, month, score range.
- **Goals** — editable target test count and target average, shown as progress bars.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Once created, click the **Web** icon (`</>`) to register a web app. You don't need Hosting for this step.
3. Copy the `firebaseConfig` values shown — you'll paste these into `.env` in step 3.
4. In the left sidebar go to **Build → Firestore Database → Create database**. Start in **production mode** (we ship proper security rules below).
5. In the left sidebar go to **Build → Authentication → Sign-in method**, and enable **Anonymous**. This is what lets the app work with no visible login screen while still keeping each install's data private.

## 2. Deploy the security rules

The file `firestore.rules` in this project locks every document to the
anonymous uid that created it — so even though there's no login UI, your
data isn't publicly readable.

Easiest path: open **Firestore Database → Rules** tab in the Firebase console,
paste the contents of `firestore.rules`, and click **Publish**.

(If you have the Firebase CLI installed: `firebase deploy --only firestore:rules`.)

## 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the six values from your Firebase web app config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 4. Install and run

```bash
npm install
npm run dev
```

This opens the app at `http://localhost:5173`. On first load it silently signs
in anonymously, then any test you log is saved straight to Firestore under
`users/{your-anonymous-uid}/tests/...`.

## 5. Build for deployment (optional)

```bash
npm run build
```

This outputs static files to `dist/`, deployable to Firebase Hosting, Vercel,
Netlify, or any static host. If you use **Firebase Hosting**, run
`firebase init hosting` (point it at `dist`), then `firebase deploy`.

## How the streak math works

Because you said you might switch cadence over time (daily → alternate days →
weekly), the streak is never stored as a single number that gets incremented.
Instead, every time the dashboard loads it:

1. Reads `startDate` and a list of `frequencyChanges` (each with the date the
   change took effect).
2. Walks forward day-by-day from `startDate` to today, generating the
   "expected test date" at each step — using whichever cadence was active on
   that date.
3. Checks whether a logged test covers each expected date. Covered → streak
   continues. An expected date in the past with nothing logged → streak resets
   to 0 from that point.

This means you can change frequency at any time (the change only applies
going forward) or edit/delete a past test, and the streak — current, longest,
and the whole heatmap — recalculates correctly rather than drifting out of
sync.

## Project structure

```
src/
  lib/
    firebase.js       Firebase init + anonymous auth
    firestore.js       All Firestore reads/writes (tests, streak settings, goals)
    streakEngine.js    Pure streak calculation (no Firebase/React dependency)
    stats.js           Derived stats: averages, subject grouping, monthly grouping
  hooks/
    useDashboardData.js  Wires auth + Firestore subscriptions into React state
  components/
    StreakHero.jsx        Big current-streak display
    StreakHeatmap.jsx     GitHub-style calendar grid
    StreakSetupPanel.jsx  Set start date / change cadence
    StatCard.jsx           Small metric card
    Charts.jsx              Score trend, subject average, monthly progress
    TestEntryForm.jsx      Add-test form
    FiltersBar.jsx          Subject/type/month/score filters
    TestTable.jsx           Editable list of logged tests
    GoalsPanel.jsx          Target tests / target average progress bars
  App.jsx              Assembles everything
firestore.rules        Per-uid data isolation rules
```

## Notes

- "No login" means no visible sign-in form — under the hood the app still
  uses Firebase Anonymous Auth so your data is scoped to your browser install
  and isn't world-readable. If you clear your browser data or switch devices,
  you'll get a new anonymous uid and start with a blank dashboard. If you want
  your data to follow you across devices later, swap `ensureAnonymousAuth()`
  in `src/lib/firebase.js` for email or Google sign-in — nothing else in the
  app needs to change, since everything else just calls `getCurrentUid()`.
