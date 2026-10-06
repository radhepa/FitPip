<p align="center">
  <img src="docs/images/fitpip-banner.png" alt="FitPip: Small steps. Stronger you. Pip waves beside real screenshots of Today, Profile, and a workout." width="100%" />
</p>

<h1 align="center">FitPip</h1>

<p align="center">
  <strong>Your workout log, progress tracker, and very small cheerleader.</strong><br />
  Lift, run, swim, stretch. Pip keeps count.
</p>

<p align="center">
  Works offline · Installs on your phone · Syncs across devices · Light &amp; dark themes
</p>

<p align="center">
  <a href="#meet-pip">Meet Pip</a> ·
  <a href="#a-look-around">Screenshots</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#put-fitpip-on-your-phone">Phone setup</a> ·
  <a href="docs/development.md">Development guide</a>
</p>

---

FitPip is a personal fitness app that brings your training into one place: the sets you lifted, the miles you covered, the week you planned, and the progress you made along the way.

It combines practical workout tools with a little game-like motivation. Log a session, notice a new personal record, earn XP, and watch your Pip badges grow from Wood to Legend. Whether today's plan is a heavy lift or a gentle stretch, it belongs here.

## Meet Pip

<p align="center">
  <img src="docs/images/pip-wave.png" alt="Pip, a blue panda in a pale blue headband, waving hello" width="150" />
  <img src="docs/images/pip-flex.png" alt="Pip showing off a tiny flex" width="150" />
  <img src="docs/images/pip-sleep.png" alt="Pip curled up for a well-earned rest" width="150" />
</p>

Pip is your blue panda training companion. He celebrates your records, remembers how your lifts have changed, offers a pep talk when you need one, and makes room for rest days too.

Tap him for another thought, ask **How am I doing?**, revisit a **Throwback**, or choose a **Pep talk**. His expressions and poses match what he says. Finish a workout and he has a little celebration waiting for you.

*Big effort. Tiny cheerleader.*

## A look around

Real app screens, captured with FitPip's built-in guest data. The first row shows the dark theme; the second shows the light theme. Select an image to see it at full size.

<table>
  <tr>
    <th width="33%">Today</th>
    <th width="33%">Workout</th>
    <th width="33%">Profile</th>
  </tr>
  <tr>
    <td align="center"><a href="docs/images/today.png"><img src="docs/images/today.png" alt="Today: Pip's encouragement, weekly streak, training plan, and quick-start activities" width="260" /></a></td>
    <td align="center"><a href="docs/images/workout.png"><img src="docs/images/workout.png" alt="An active workout with bench press weight, reps, optional RPE, and large set-logging controls" width="260" /></a></td>
    <td align="center"><a href="docs/images/profile.png"><img src="docs/images/profile.png" alt="Profile: a Pip rank crest, XP level, training totals, and a strength map" width="260" /></a></td>
  </tr>
  <tr>
    <td align="center">Your day, with a little encouragement.</td>
    <td align="center">Everything you need between sets.</td>
    <td align="center">Progress you can see and celebrate.</td>
  </tr>
  <tr>
    <th>Plan</th>
    <th>Weigh-in</th>
    <th>Progress</th>
  </tr>
  <tr>
    <td align="center"><a href="docs/images/plan.png"><img src="docs/images/plan.png" alt="Weekly plan with weightlifting, cardio, yoga, and rest days" width="260" /></a></td>
    <td align="center"><a href="docs/images/weigh-in.png"><img src="docs/images/weigh-in.png" alt="Weigh-in: an interactive scale, weight trend, and recent changes" width="260" /></a></td>
    <td align="center"><a href="docs/images/progress.png"><img src="docs/images/progress.png" alt="Progress: a muscle map colored by weekly training volume and an exercise list" width="260" /></a></td>
  </tr>
  <tr>
    <td align="center">A week that fits your routine.</td>
    <td align="center">Watch the trend, not the wiggle.</td>
    <td align="center">See where your effort is going.</td>
  </tr>
</table>

## Built for the way you train

<p align="center">
  <img src="docs/images/pip-flex.png" alt="Pip flexing, ready for the next set" width="110" />
</p>

| Bring your… | FitPip keeps track of… |
| --- | --- |
| **Strength sessions** | Weight, reps, optional RPE, personal records, notes, and a configurable rest timer. |
| **Runs, rides, and swims** | Time, distance, and pace, with a stopwatch when you need one. |
| **Yoga, stretching, boxing, and sports** | Timed holds, rounds, and practice alongside your lifts and cardio. |
| **Weekly routine** | Workout categories, saved routines, and individual activities, with multiple items per day. |
| **Bodyweight goals** | Daily weigh-ins, a goal line, trend charts, and recent changes. |
| **Training history** | Past sessions you can edit, favorite, and repeat, plus exercise progress and muscle maps. |

Set up your exercises before the workout clock starts. When you're ready, tap **Begin workout** and log as you go. Your previous sets help you pick up where you left off.

### A little more legendary

<p align="center">
  <img src="docs/images/pip-ranks.png" alt="All ten Pip rank crests: Wood, Bronze, Silver, Gold, Platinum, Emerald, Diamond, Master, Elite, and Legend" width="100%" />
</p>

Earn XP for sets, time spent training, finished workouts, new activities, and personal records. Strength badges reflect your best lifts against the selected bodyweight-based standards; cardio badges use pace where supported, and practice badges grow with time invested.

A starting assessment helps you find your first rank. You can skip unfamiliar exercises, do it later, or retake it from Settings. Your logged training continues to shape your progress.

## Installation

<p align="center">
  <img src="docs/images/pip-think.png" alt="Pip thinking through the setup with you" width="110" />
</p>

### 1. Try FitPip locally

You'll need **Git** and **Node.js 22.18 or newer**, with npm.

```bash
git clone https://github.com/radhepa/FitPip.git
cd FitPip
npm ci
npm run dev
```

Open the local address printed by Vite, usually **http://localhost:5173**. Select **Continue as guest** to explore sample workouts, the weekly plan, weigh-ins, and Pip without configuring a backend. You can complete the starting assessment or select **Do this later**.

**Guest data stays in this browser on this device.** Guest mode does not sync with an account; export anything you want to keep from **Settings → Your data**.

### 2. Connect your own account and sync

For account sign-in and syncing between devices, connect FitPip to a Supabase project.

1. **Create a project** in Supabase.
2. **Apply every SQL migration** from [`supabase/migrations`](supabase/migrations), in ascending filename order. Open the project's **SQL Editor**, paste each file, and run it before moving to the next. Include the final `20260929000100_favorite_workouts.sql` migration.
3. **Create a `.env` file** in the repository root using [`.env.example`](.env.example) as the template. Fill in your project's URL and **anon public key**:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

4. **Restart the development server.** Create an account from FitPip's sign-in screen. If email confirmation is enabled, confirm your email before signing in. For a personal instance, you can instead create the user in **Authentication → Users** with auto-confirm enabled, then disable new sign-ups.
5. **Sign in with your account.** The first sync on a new device needs an internet connection.

Only the public key belongs in these browser environment variables. Keep service-role and OpenRouter keys out of the frontend. FitPip's migrations enable row-level security to scope database access to the signed-in user.

### 3. Deploy your instance

Build FitPip with:

```bash
npm run build
```

The production app is generated in `dist/`.

| Host | Configuration |
| --- | --- |
| **Vercel** | Import the repository, select the **Vite** preset, and add the two `VITE_SUPABASE_*` environment variables. The included [`vercel.json`](vercel.json) handles app routes. |
| **Cloudflare Pages** | Use `npm run build` as the build command and `dist` as the output directory. Add the same environment variables. |
| **Another static host** | Serve `dist/` over HTTPS and route app navigation, such as `/profile`, back to `index.html`. |

For password-reset emails, set your deployed address as Supabase's **Site URL** and add `https://your-domain/reset-password` to the allowed **Redirect URLs** under Authentication's URL configuration.

## Put FitPip on your phone

<p align="center">
  <img src="public/icons/icon-192.png" alt="Pip's blue FitPip home-screen icon" width="76" />
</p>

FitPip is a Progressive Web App: you install it from your browser. Open your deployed **HTTPS** address on your phone.

| Device | Installation |
| --- | --- |
| **iPhone or iPad** | In Safari, open the Share menu and choose **Add to Home Screen**, then **Add**. |
| **Android** | In Chrome, open the menu and choose **Install app** or **Add to Home screen**, then confirm. |

Open FitPip from its new icon and sign in there. The installed app may need its own sign-in even if you've already signed in through the browser. Updates are fetched when you open the app online.

*Pip would help carry your gym bag, but the bag is bigger than he is.*

## No signal? Keep going.

<p align="center">
  <img src="docs/images/pip-sleep.png" alt="Pip resting peacefully while your workout is saved on your device" width="110" />
</p>

Once the app has loaded and an account's first sync is complete, FitPip keeps a local copy of your training in IndexedDB. Log sets, finish workouts, browse history, adjust your plan, and record weigh-ins without a connection. Changes sync to Supabase when you're online again and the app is open.

The Today screen and Settings show your sync status. If the same record changes on two devices while offline, the later edit wins. Account sign-in, ExerciseDB searches, loading starter exercises from the server, and optional workout suggestions need a connection.

Your records are yours to take with you: **Settings → Your data** exports workouts and weigh-ins as CSV, or a full copy as JSON. Starting-assessment answers are stored on the current device and do not sync.

## Development

<p align="center">
  <img src="docs/images/pip-cheer.png" alt="Pip raising both paws to celebrate" width="110" />
</p>

FitPip uses **React, TypeScript, Vite, and Tailwind CSS**, with **Dexie / IndexedDB** for local storage and **Supabase Auth + Postgres** for accounts and sync. `vite-plugin-pwa` provides the installable app shell.

```bash
npm run dev       # Start the development server
npm run build     # Typecheck and create a production build
npm run preview   # Preview the production build locally
npm test          # Run unit tests
npm run lint      # Run oxlint
```

The [development guide](docs/development.md) covers workout behavior, scoring, the exercise catalog, database setup, and optional workout suggestions. For the visual side, see the [design system](docs/design-system.md) and [Pip's icons and rank crests](docs/badge-art.md).

---

<p align="center">
  <img src="docs/images/pip-love.png" alt="Pip sharing a little panda hug" width="120" /><br />
  <strong>One set. One step. One small reason to come back.</strong><br />
  See you at the next workout. — Pip
</p>
