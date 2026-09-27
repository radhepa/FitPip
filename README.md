# FitPip

A personal, single-user workout log for lifts, runs, rides, swims, yoga and stretching, with Pip the
blue panda keeping count. Mobile-first, installs on your phone's home screen like an app (iPhone and
Android), synced between devices through Supabase. Free to run.

Stack: Vite, React, TypeScript, Tailwind, vite-plugin-pwa, Supabase (Auth + Postgres).

## Setup

1. **Create a Supabase project** (free tier) at supabase.com.
2. **Run the migrations.** In the dashboard open *SQL Editor*, and paste + run each file from
   `supabase/migrations/` in this order (each is safe to re-run):
   1. `20260921000100_types_and_helpers.sql`
   2. `20260921000200_exercises.sql`
   3. `20260921000210_starter_exercise_catalog.sql`
   4. `20260921000300_sessions_and_sets.sql`
   5. `20260921000400_user_settings.sql`
   6. `20260921000500_templates_and_schedule.sql` (Phase 2: templates, weekly plan)
   7. `20260921000600_workout_setup_and_rpe.sql` (set a workout up before beginning it; RPE on sets)
   8. `20260925000100_activities.sql` (cardio, swimming, yoga, stretching, boxing and sports: ~80
      starter activities, time and distance on sets, distance unit)
   9. `20260925000200_week_plan.sql` (any number of routines and activities per day; your old
      one-routine-per-day schedule is copied over)
   10. `20260925000300_body_weight.sql` (weigh-ins and a goal weight)
   11. `20260926000100_more_activities.sql` (33 more everyday cardio moves, yoga poses and stretches;
       existing accounts get them straight away)
   12. `20260926000200_week_plan_categories.sql` (plan a day by kind of workout: Weightlifting,
       Cardio, Yoga, Stretching...)
   13. `20260927000100_offline_sync.sql` (lets your devices sync: a server-side change clock and a
       record of deleted rows)
   14. `20260927000200_rest_seconds.sql` (the rest timer length setting)
   15. `20260928000100_profile.sql` (your name on the profile, and whether your lifts are ranked
       against men's or women's standards)
   16. `20260928000200_expanded_catalog.sql` (373 more exercises: single-arm cable work, plate-loaded
       and pin-loaded machines, barbell and Olympic lifts, dumbbells and kettlebells, bodyweight and
       TRX, carries and sleds, cardio, conditioning, track running, swimming, boxing, sports and
       classes; existing accounts get them straight away)
3. **Create your user.** *Authentication → Users → Add user → Create new user*: enter your email
   and a password and tick *Auto Confirm User*. Creating the user also fills your exercise bank.
4. **Lock sign-ups** (it's a one-person app): *Authentication → Sign In / Providers* → turn off
   *Allow new users to sign up*.
5. **Add your keys.** *Project Settings → API*: copy the Project URL and the `anon` public key
   into a new `.env` (copy `.env.example`).
   For *Forgot password?* emails: *Authentication → URL Configuration*, set the Site URL to where the
   app lives (e.g. `https://your-app.vercel.app`) and add `https://your-app.vercel.app/reset-password`
   to the Redirect URLs.
6. `npm install`, then `npm run dev`.

## What's where

- **Today**: Pip, who knows your training. He opens with what fits your day and acts out everything he
  says: over 400 everyday lines that match his pose (a flex is about strength, a yawn about rest) and
  personal ones from your own history ("two weeks ago you lifted 135 on Bench, now 155", new records,
  your streak, how far you are from your goal weight). Tap him for another line, or use the chips:
  *How am I doing?*, *Throwback*, *Pep talk*. Now and then he asks how your energy is, with quick
  replies. Below him: your week streak (weeks in a row with 2+ workouts; tap it for what this week still
  needs), this week against your plan, your latest weight, and today's lineup. Each planned
  routine or activity has its own start button, or do them all as one workout. Nothing planned?
  Tap Lift, Cardio, Swim, Yoga, Stretch or Boxing to start straight away.
- **Plan**: the week as seven cards. Say what KIND of workout each day is (Weightlifting, Cardio,
  Yoga, Stretching, Swimming, Boxing, Sports), or put routines ("Push day") and single activities
  ("Freestyle Swim", "Heavy Bag", "Pigeon Pose") on it. Any mix, as many as you like. Tap one to
  reorder, remove or start it, and copy a whole day to other days. A kind of workout starts empty with
  the exercise picker open on that kind.
- **Weigh-in**: the scale. Drag the ruler, tap ±1/±0.1 or type, pick the day, and step on. One
  weigh-in a day (saving again replaces it); trend chart with your goal line, 7/30 day change,
  7-day average and streak.
- **Profile**: your ranks, badges and XP (see below).
- **Workouts** are split into Strength, Cardio, and Yoga & stretching sections. Lifts log weight ×
  reps (with steppers, RPE chips and a rest timer), holds and rounds have a countdown timer that
  logs itself, and runs/rides/swims log time and distance (or use the stopwatch) with live pace.

## Logging a workout

Tap **Workout** on Home. The workout opens in its *set up* state, with no clock running: add the
exercises you plan to do (or arrive with today's template or a suggestion already loaded), change their
target sets and reps, reorder or remove them. Tap **Begin workout** when you're ready and the clock starts,
counting in seconds. Log each set with its weight, reps and an optional **RPE** (1 to 10, in halves).
A workout you set up but haven't begun stays on Home as "Continue setting up" and is not counted in
History, Progress or suggestions until you begin it.

- **Undo.** Deleting a set shows an *Undo* bar for a few seconds.
- **Notes.** Add a note to the whole workout, or to any exercise in it ("seat at 4", "left shoulder
  tight"). They save by themselves and show on the workout summary.
- **Rest timer.** After a lifting set a countdown runs. Set its length (or turn it off) under
  *Settings → Rest timer*; it follows you between devices. You can still add or trim 15 s on a single
  rest without changing the setting.
- **Editing a finished workout.** *Edit workout* on the summary changes sets, notes and the name in
  place. The recorded time never changes, and the workout doesn't come back as "open" on Home.
- **Personal records.** A set that beats every earlier workout gets a *PR* pill (and a little confetti).
- **Timers keep going.** A running rest, stopwatch or countdown survives switching tabs or the phone
  closing the app, and the screen stays on while one runs.
- **Forgot to finish?** A workout with nothing logged for 3 hours offers to finish at the time of its
  last set, so its time isn't counted up to the next day.

## Your data

*Settings → Your data* saves every set and every weigh-in as spreadsheet files (CSV), or a full copy
of everything as JSON. *Settings → Account → Change password*, or *Forgot password?* on the sign-in
screen (see setup step 5).

## Ranks, badges and XP

### Starting assessment

After sign-in and the first sync, new and existing accounts see a one-time fitness assessment.
It asks age, bodyweight, comparison standards, and five familiar exercises: push-ups, bench press,
back squat, deadlift and pull-ups. Weighted lifts accept a known one-rep max or a best set of
1–15 reps. Every exercise has a **Haven’t done this** option.

The starting rank averages the answered exercises' scores using the existing strength standards;
skipped exercises are excluded. With all five skipped, Wood is an unscored starting point. Age is
recorded but does not adjust this version's standards. Answers create no workout sets or XP and
do not replace an existing logged-history overall rank. With no logged rank, the Profile hero
shows the starting rank. Assessment bodyweight is a fallback until a weigh-in is available.

Drafts, completion and assessment answers are saved per account **on this device** in IndexedDB;
they do not sync to other devices. The selected comparison standards sync through existing settings.
No database migration is needed. Reloading preserves answers; **Do this later** dismisses the
flow without replacing a saved result. Retake it from Settings or the assessment card on Profile.

The flow lives at `/welcome`; questions are in `src/config/assessment.ts`, scoring and validation
in `src/lib/assessment.ts`, and persistence in `src/data/onboarding.ts`. The device-local completion
key is versioned so a future onboarding revision can be rolled out deliberately.

### Workout ranks

The **Profile** tab turns your history into a game. Nothing extra is stored: it's all worked out from
your sets, workouts and weigh-ins, so editing a set or a weigh-in updates it straight away.

- **10 ranks**: Wood, Bronze, Silver, Gold, Platinum, Emerald, Diamond, Master, Elite, Legend.
- **Lift badges.** The best set of each lift becomes an estimated one-rep max (or reps, for pull-ups,
  push-ups and other bodyweight moves) and is compared with strength standards for people who lift,
  at your bodyweight (the average of your last week of weigh-ins). You get a percentile ("stronger
  than 64% of lifters"), a rank, what the average lifter your size does, and what each rank takes.
  Pick men's or women's standards the first time you open the tab.
- **Strength map.** The body map coloured by rank: each muscle takes the rank of its best lift (lifts
  where it only helps count at 80%). The overall rank averages chest, back, shoulders, arms, legs and
  core.
- **Cardio and practice badges.** Running, rowing, ski erg, outdoor cycling and freestyle swimming
  are ranked on your best pace (any distance, converted with Riegel's formula). Walking, indoor
  cycling, HIIT, other swims, boxing, yoga, stretching and sports rank up with hours put in.
- **XP and levels.** 10 XP per lifting set, 3 XP per minute of cardio or practice, 25 for finishing a
  workout, 50 per personal record and 20 for trying something new. The workout summary shows what
  each workout earned, any records, and every badge it ranked up.

Standards, rank thresholds, XP amounts and badge kinds live in `src/config/` (`strengthStandards.ts`,
`ranks.ts`, `xp.ts`, `activityBadges.ts`). All ten ranks use matching Pip enamel crests, growing from
a wooden medallion to Legend's flame crown. See [docs/badge-art.md](docs/badge-art.md) for the artwork
and regeneration commands, or [preview the full set](docs/art-preview.png).

## Deploy (auto-deploys on every push to `main`)

**Vercel:** import the GitHub repo. Framework preset *Vite*; add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as environment variables. `vercel.json` already handles SPA routing.

**Cloudflare Pages:** connect the repo, build command `npm run build`, output directory `dist`,
same two environment variables.

The anon key is safe to ship to the browser: row level security on every table is what
protects the data.

## Put it on your phone

The app is a PWA, so it installs from the browser with no app store. It has to be opened from its
deployed `https://` address (see Deploy above), not from your computer's `localhost`.

**iPhone (use Safari, not Chrome):** open the address, tap the Share button, choose *Add to Home
Screen*, then *Add*. Open FitPip from the new icon.

**Android (Chrome):** open the address, tap the ⋮ menu, choose *Install app* (or *Add to Home
screen*), then *Install*.

Then sign in with the email and password you made in Supabase. The installed app keeps its own
sign-in, so you sign in once inside it even if you already did in the browser. Updates arrive by
themselves: the next time you open FitPip online it fetches the newest version.

## Works offline

FitPip keeps a full copy of your data on the device (in the browser's IndexedDB) and works from
that copy, so everything runs without a connection: logging sets, finishing workouts, browsing
history, the plan, weigh-ins. Changes are saved on the device first and sent to Supabase in the
background whenever there is a connection.

- **Sync** runs when you open the app, when the connection returns, a moment after every change and
  every minute while it is open. There is a status icon next to Settings on Today, a banner while
  you are offline, and a Sync card in Settings (Sync now, and what to do if the server ever refuses a
  change). iPhones do not sync in the background: it happens when you open the app.
- **Two devices** stay in step. If the same thing is edited on both while apart, the later edit
  wins. Deleting something on one device removes it on the others.
- **First time on a device** it downloads your data once (this needs a connection). After that it
  opens instantly, even with no signal and an expired sign-in.
- Your data on the server is the backup. Signing out keeps changes that have not synced on the device
  (you are asked first) and they send the next time you sign in.
- The one thing that still needs a connection is *Load starter exercises* (and Suggest, below).

## Exercise data

Exercises come from [ExerciseDB](https://github.com/ExerciseDB/exercisedb-api) (free instance at
`oss.exercisedb.dev`: names, target muscles, equipment, demo GIFs, steps). They are copied into
your own database, so the app keeps working if that service is down.

- The starter bank is generated from `scripts/starter-picks.json`:
  `node scripts/build-starter-seed.ts` (add `--refresh` to re-download the records).
- The 373-exercise expansion is hand-written data in `src/config/catalog/` (one file per family:
  single-arm cable, machines, barbell, dumbbell, bodyweight, cardio...). Edit or add exercises there,
  then run `node scripts/build-catalog-migration.ts` and commit both; a test fails if the migration
  is out of date or a name repeats an earlier one. It leans on the Purdue CoRec floor (plate-loaded
  stations, cable stacks everywhere, Olympic platforms, slam wall, battle ropes, TRX, atrium track,
  spin studio) and on cutting weight without losing strength.
- Single-arm cable lifts have their own strength standards (`sa_cable_*` in
  `src/config/strengthStandards.ts`). No one publishes tables for them, so they are the two-handed
  standards scaled to one arm; a single-arm or single-leg lift is never ranked against a two-handed one.
- In the app, *Add exercise → Find in ExerciseDB* searches the API and saves what you pick.
- ExerciseDB's muscle and equipment names are translated to this app's normalized names in one
  file: `src/config/exerciseDbMap.ts`.
- The free instance rate-limits bursts and its data terms are not spelled out; that is fine for
  personal use, so check before redistributing anything.

## Workout suggestions

**Off by default.** The public build hides *Suggest a workout* until the function below is deployed and
the key is set. To show it again, set `VITE_ENABLE_SUGGEST=true` (in `.env`, and in Vercel's
environment variables) and rebuild.

The **Suggest a workout** screen (a card on Today) asks an Edge Function for a workout based
on your recent training, weekly muscle volume, today's planned template and your exercise bank. You can
start the suggestion as a workout or save it as a template. There is no SQL for this: the only setup is
deploying one function and adding one secret.

**1. Deploy the function (once).** Pick one:

- *CLI.* Find your project ref in your project URL (`https://<ref>.supabase.co`), then:

  ```
  npx supabase login
  npx supabase link --project-ref <ref>
  npx supabase functions deploy suggest-workout
  ```

  If it asks for Docker, add `--use-api` to the last command. `supabase/config.toml` already turns off
  the platform JWT check: the function verifies the caller's token itself.
- *Dashboard.* Edge Functions → Deploy a new function → Via Editor. Name it `suggest-workout`, paste in
  `supabase/functions/suggest-workout/index.ts` (it is a single self-contained file), switch **Verify JWT
  off** (the function checks the token itself), and deploy.

**2. Add your OpenRouter key.** Create one at [openrouter.ai/keys](https://openrouter.ai/keys), then either
open Edge Functions → Secrets and add `OPENROUTER_API_KEY`, or run:

```
npx supabase secrets set OPENROUTER_API_KEY=<your key>
```

That is everything. Until the key exists the Suggest screen says so instead of failing.

**Model.** It defaults to `openai/gpt-4o-mini` (a suggestion costs a fraction of a cent). To use another,
add a secret `OPENROUTER_MODEL` with any [OpenRouter model id](https://openrouter.ai/models), for example
`google/gemini-2.5-flash`. No redeploy is needed. Set a spend limit on the OpenRouter key if you like.

**How it stays safe.** The key lives only in the function's secrets and is never sent to the browser. The
function verifies the caller's Supabase session on every request, reads your exercise bank with your own
row level security (the model can only pick exercises you own, by short refs rather than ids), validates the
model's reply with zod before anything reaches the app, and stores nothing.

**If something goes wrong,** the screen tells you which step is missing: *function not deployed*, *no
OpenRouter key*, *key rejected* or *out of credits*. Tap "Try again" for busy or unusable replies.

## Scripts

```
npm run dev      local dev server
npm run build    typecheck + production build
npm test         unit tests
npm run lint     oxlint
npm run icons    regenerate the PWA icons
npm run badges   regenerate the ten rank crests and locked badge (Node 22.18+)
```
