# FitPip development guide

Technical notes for running, extending, and maintaining FitPip. Start with the [README](../README.md) for screenshots, installation, deployment, and phone setup.

## Project layout

```text
src/
  components/      Shared interface components and Pip's SVG rig
  config/          Brand, ranks, XP, standards, exercise catalog, and Pip's lines
  data/            Authentication, local storage, exports, and server sync
  hooks/           Screen state, timers, appearance, and Pip's behavior
  lib/             Calculation, validation, and other domain logic
  screens/         App routes
  types/           Database rows and domain types
supabase/
  migrations/      SQL schema and seed data, applied in filename order
  functions/       Optional workout-suggestion Edge Function
  seed/            Cached starter exercise records
public/            Fonts, PWA icons, and rank crests
scripts/           Catalog, icon, and badge generation
docs/              Design notes, artwork, and README images
```

Use Node.js **22.18 or newer**. The artwork and catalog scripts use native TypeScript imports.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite development server. |
| `npm run build` | TypeScript checks and production output in `dist/`. |
| `npm run preview` | Serve the production output locally. |
| `npm test` | Vitest tests for domain logic and sync behavior. |
| `npm run lint` | oxlint checks. |
| `npm run icons` | Regenerate FitPip's PWA icons. |
| `npm run badges` | Regenerate all ten rank crests and the locked badge. |

## Database setup

Apply **every** file in [`supabase/migrations`](../supabase/migrations) in ascending filename order. The migrations create the exercise bank, sessions and sets, settings, templates, weekly plans, activities, weigh-ins, sync metadata, profile fields, and favorites.

The latest migration is [`20260929000100_favorite_workouts.sql`](../supabase/migrations/20260929000100_favorite_workouts.sql). It adds the `sessions.favorite` column used when starring workouts.

Run migrations before creating a new account so its exercise bank can be populated by the sign-up trigger. For a personal instance, create a user in Supabase's Authentication dashboard with auto-confirm enabled and disable further sign-ups if desired. FitPip also supports account creation from the sign-in screen when Supabase permits it.

The client needs only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; see [`.env.example`](../.env.example). Each table uses row-level security scoped to the user's ID. Private API keys and service-role credentials belong on the server.

## Workout behavior

A new workout starts in a setup state with no clock running. Add and reorder exercises, set targets, and choose **Begin workout** when ready. An unbegun workout appears on Today as **Continue setting up** and does not count toward history, progress, or training-based suggestions.

Strength, cardio, and yoga / stretching have separate sections. Lifts log weight and reps with optional RPE. Timed holds and rounds use countdowns; runs, rides, and swims accept time and distance or a stopwatch, with pace where applicable.

- **Previous sets:** logging controls prefill from earlier training and carry the previous set forward during a workout.
- **Notes:** workout and exercise notes save automatically and appear in the summary.
- **Undo:** deleting a set briefly offers an Undo action.
- **Rest:** configure the default timer in Settings. Adding or trimming 15 seconds during a rest changes only that rest.
- **Records:** sets that beat earlier workouts receive a PR marker and confetti.
- **Timers:** elapsed time is based on timestamps, so switching tabs or closing the app does not reset a running timer. The app requests that the screen stay awake while a timer runs where supported.
- **Finished workouts:** editing changes the original session without reopening it on Today. Its recorded time changes only when explicitly edited.
- **Forgotten workouts:** after three hours without a logged set, FitPip offers to finish at the last set's time. A session finished much later can also be corrected from its summary.
- **Time corrections:** use Duration on a summary, Change time during editing, or Change under the active clock to adjust the appropriate timestamps.
- **Favorites and repeats:** star a finished workout to find it in Favorites. Repeat creates a new setup with copied exercises and targets, leaving the original session intact.

Weights on lifting sets are stored in the unit entered. Changing the weight setting does not convert historical lift entries; weigh-ins support conversion.

## Starting assessment

After sign-in and the first sync, the assessment asks for age, bodyweight, comparison standards, and five exercises: push-ups, bench press, back squat, deadlift, and pull-ups. Weighted lifts accept a known one-rep max or a best set of 1–15 reps. Each exercise offers **Haven't done this**.

The starting rank averages scores for answered exercises; skipped exercises do not count. If all five are skipped, Wood is an unscored starting point. Age is recorded but does not adjust the current standards. Answers create no workout sets or XP and do not replace an overall rank calculated from logged history. Assessment bodyweight is a fallback until a weigh-in is available.

Drafts, completion, and answers are account-scoped in this device's IndexedDB and do not sync to other devices. Selected comparison standards sync through user settings. Reloading preserves the draft; **Do this later** dismisses the flow without replacing a saved assessment. Retake it from Settings or the assessment card on Profile.

The route is `/welcome`. Questions live in [`src/config/assessment.ts`](../src/config/assessment.ts), scoring and validation in [`src/lib/assessment.ts`](../src/lib/assessment.ts), and persistence in [`src/data/onboarding.ts`](../src/data/onboarding.ts). No assessment migration is required.

## Ranks, badges, and XP

Ranks and rewards are calculated from sets, workouts, and weigh-ins. Editing those records updates the results.

- **Ten ranks:** Wood, Bronze, Silver, Gold, Platinum, Emerald, Diamond, Master, Elite, and Legend.
- **Lift badges:** the best qualifying set becomes an estimated one-rep max, or a rep result for supported bodyweight exercises. It is compared with exercise-specific men's or women's bodyweight tables, normally using the average of the last week's weigh-ins. Load estimates use at most ten reps; longer sets receive a conservative estimate.
- **Strength map:** each muscle takes the rank of its best lift; assisting-muscle contributions count at 80%. Overall rank averages chest, back, shoulders, arms, legs, and core.
- **Pace badges:** supported running, rowing, ski erg, outdoor cycling, and freestyle swimming performances use pace, with distance normalization through Riegel's formula.
- **Practice badges:** walking, indoor cycling, HIIT, other swimming, boxing, yoga, stretching, and sports progress through accumulated time.

| Action | XP |
| --- | --- |
| Log a lifting set | 10 |
| Log a timed hold or round | 3, plus XP for its duration |
| Train for a minute of cardio or practice | 3 |
| Log distance without time | 10 per kilometre; swimming uses a 4× multiplier |
| Finish a workout | 25 |
| Set a personal record | 50 |
| Try a new exercise or activity | 20 |

Configuration lives in [`strengthStandards.ts`](../src/config/strengthStandards.ts), [`ranks.ts`](../src/config/ranks.ts), [`xp.ts`](../src/config/xp.ts), and [`activityBadges.ts`](../src/config/activityBadges.ts). See [Pip's artwork guide](badge-art.md) for the rank crests.

The [strength-ranking notes](strength-ranking.md) document the reference data, comparison limits, movement-specific standards, and scoring model.

## Storage, sync, and exports

The data layer writes to Dexie / IndexedDB first and queues account changes for Supabase. Guest mode uses a separate database with seeded demo data and no server sync.

Sync runs on opening the app, reconnecting, shortly after changes, and periodically while the app is open. The server provides a change clock and deletion records so devices receive edits and removals. Concurrent edits to the same record resolve by the later edit. On iPhone, sync happens while the app is open rather than through a background task.

The first account sync on a device needs a connection. Afterward, cached data lets the app open offline, including when the sign-in cannot currently be renewed. Today has a sync indicator; Settings offers Sync now and details about any rejected change.

Signing out preserves pending changes when the user chooses to keep them; they can be sent after signing back into the same account. Guest data remains local and does not transfer automatically to a signed-in account.

**Settings → Your data** exports workouts and weigh-ins as CSV, or everything as JSON. Account settings also support password changes; the sign-in screen supports password-reset emails. Configure Supabase's Site URL and `/reset-password` redirect for each deployed instance.

## Exercise catalog

The built-in bank includes strength exercises, cardio, swimming, boxing, sports, yoga, and mobility. Imported exercise records include names, muscle targets, equipment, demo images, and instructions from [ExerciseDB](https://github.com/ExerciseDB/exercisedb-api). The imported records are copied into the user's database, so previously saved exercises do not depend on a live API response.

- The starter selection is [`scripts/starter-picks.json`](../scripts/starter-picks.json). Run `node scripts/build-starter-seed.ts` to rebuild its migration; add `--refresh` to download fresh records.
- The expanded catalog lives in [`src/config/catalog`](../src/config/catalog). Edit the appropriate family, then run `node scripts/build-catalog-migration.ts`. Commit the catalog and generated migration together. Tests check for stale generated SQL and duplicate names.
- ExerciseDB vocabulary is normalized in [`src/config/exerciseDbMap.ts`](../src/config/exerciseDbMap.ts).
- **Add exercise → Find in ExerciseDB** requires a connection and saves the selected record locally.
- Ranking requires a compatible movement-specific reference table. Unsupported variations, including most single-arm cable lifts, remain unranked while still being available to log. See the [strength-ranking notes](strength-ranking.md) for supported comparisons and logging conventions.

## Optional workout suggestions

Suggestions are **disabled by default**. They require the `suggest-workout` Supabase Edge Function, an OpenRouter API key, and `VITE_ENABLE_SUGGEST=true` in the frontend build environment. The rest of FitPip works without this integration.

The function receives recent training, weekly muscle volume, today's planned routine, and the user's exercise bank. A suggestion can be started as a workout or saved as a routine.

### Deploy the function

Find the project reference in the Supabase project URL (`https://<project-ref>.supabase.co`), then run:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase functions deploy suggest-workout
```

If the CLI requires Docker, add `--use-api` to the deploy command. [`supabase/config.toml`](../supabase/config.toml) disables the platform JWT check for this function because the function verifies the caller's token itself.

Alternatively, deploy through the Supabase Edge Functions editor. Name the function `suggest-workout`, paste [`supabase/functions/suggest-workout/index.ts`](../supabase/functions/suggest-workout/index.ts), turn **Verify JWT** off, and deploy. The file is self-contained and implements its own authentication check.

### Configure secrets and enable the screen

Create an [OpenRouter API key](https://openrouter.ai/keys) and add `OPENROUTER_API_KEY` in Supabase's **Edge Functions → Secrets**. Keep it in server secrets; it must not be a `VITE_*` variable.

The default model is `openai/gpt-4o-mini`. An optional `OPENROUTER_MODEL` secret can override it with another supported model ID without redeploying the function. Usage is billed through OpenRouter.

Set `VITE_ENABLE_SUGGEST=true` in `.env` and in the deployment environment, then restart or rebuild the frontend. No additional SQL migration is needed.

The function verifies the Supabase session, reads the user's bank under row-level security, and validates the model output with zod. The model selects exercises from the supplied bank using short references. The function stores no suggestion data.

The app reports missing deployment, missing credentials, rejected credentials, insufficient credits, or unusable replies, with retry controls where appropriate.

## Visual documentation

The [design system](design-system.md) describes FitPip's interface tokens and patterns. The [artwork guide](badge-art.md) documents icon and crest generation.

README screenshots in [`docs/images`](images) were captured from the running app in a new guest browser session at a 430 × 932 viewport. Today, Workout, and Profile use the dark theme; Plan, Weigh-in, and Progress use the light theme. The profile's comparison standards were selected to show the sample lifts' ranks.

Pip portraits were rendered from the existing [`Pip`](../src/components/Pip.tsx) component, and the rank strip uses the existing [`public/badges`](../public/badges) artwork. The banner arranges those assets and actual screenshots. Refresh these images when the corresponding interface or artwork changes.
