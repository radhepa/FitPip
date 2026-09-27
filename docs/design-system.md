# FitPip design system

FitPip should feel alive in your hand: quick to read mid-set, satisfying to tap, and a little bit
fun. Pip, the red-panda mascot, is part of that.

## Principles

- The next action is always the biggest, brightest thing on screen (the gradient button).
- Colour means something: the accent gradient is "do this", each kind of activity has its own
  colour, green is "goal met", red is errors and deleting.
- Everything tappable responds: buttons and cards press in, sets pop in with a check, the tab
  highlight slides, numbers roll up, timers buzz on phones that support it.
- Keep body text at 16px, inputs at 16px or larger and tap targets at least 44px.
- Keep every screen usable at 360px without horizontal scrolling. Always give a `grid` an explicit
  `grid-cols-1` base.
- Motion stops under `prefers-reduced-motion`.

## Colour

Tokens live in `src/index.css` for Night (default) and Light. Activity colours are `--cat-*`
and are looked up through `CATEGORY_INFO` in `src/lib/activity.ts`:

| Kind | Night | Light |
| --- | --- | --- |
| Strength | `#5b9dff` | `#2563eb` |
| Cardio | `#ff7a59` | `#ea580c` |
| Swimming | `#22d3ee` | `#0891b2` |
| Boxing & combat | `#ffb547` | `#b45309` |
| Yoga | `#b794ff` | `#7c3aed` |
| Stretching | `#34d399` | `#059669` |
| Sports | `#a3e635` | `#4d7c0f` |

`--grad-accent` (blue to violet) is the primary action; `--grad-hero` is the hero card behind Pip,
the workout clock and the scale. Set `--tint` on an element to colour `.icon-tile`, `.pill`,
`.filter-chip`, `.card-tint` and `.button-tint` with a category colour (`tint(category)` in
`CategoryTile.tsx`).

## Building blocks

- `.card` (rounded 20px surface with a soft shadow), `.card-hero`, `.card-tint`, `.pressable`.
- `Button` (primary gradient, secondary, tint, ghost, danger; `size="sm"`), `.icon-button`,
  `.segmented`, `.chip-row` + `.filter-chip`, `.field`.
- `CategoryTile` / `CategoryIcon` (one icon per activity kind), `ProgressRing`, `CountUp`,
  `Stepper` and `RepeatButton` (tap to step, hold to keep stepping), `Sheet` (springs up, rendered in
  a portal above the tab bar, slides away on close via `sheetExit.ts`, pull the handle down to close).
- `WeightRuler` (weigh-in dial): follows the finger 1:1, coasts after a flick and lands on a tenth,
  tap a number to glide there. The motion is in `hooks/useRulerMotion.ts` (maths in `lib/fling.ts`) and
  writes the transform straight to the DOM each frame instead of re-rendering.
- `fx.ts`: `buzz()` for haptics, `confetti()` for finished workouts and weight goals.
- `.stagger` animates children in one after another (set `--i` on each).
- CSS lives in layers: element defaults in `@layer base`, the classes above in
  `@layer components`, so Tailwind utilities always win.

## Speed and feel on phones

- Moving between screens should never show an empty page. Screen data goes through `useAsync` with a
  `cacheKey` (include any id the load depends on), so a revisit shows the last read at once while
  nothing on the device has changed. Screens outside Today load as chunks through `screen()` in
  `screens/lazy.ts`, which renders a preloaded screen straight away.
- A new page opens at the top; Back returns to where you were; tapping the current tab scrolls up
  (`hooks/useScrollMemory.ts`, `TabBar`).
- Entrance animations use `animation-fill-mode: backwards`, so a finished animation leaves no
  transform behind (and `position: fixed` children stay pinned to the screen).
- No `backdrop-filter` over the whole screen (sheet backdrops only dim) and none behind opaque
  surfaces. Small floating glass (tab bar, rest timer, undo toast) is fine.
- Long lists: memoise rows and keep their callbacks stable (see `ExerciseChooser`), and let off-screen
  rows skip rendering with `content-visibility: auto`. A screen with a long list draws the first rows
  with the page and the rest a moment later (`useDeferredValue(SHOWN, FIRST_ROWS)` on Progress), so it
  opens as quickly as the others and keeps its fade-in.
- A card that loads its own data keeps its full size while it loads (the Progress muscle map is drawn
  blank), so nothing below it jumps down when the data arrives.
- `touch-action: manipulation` on the page stops double-tap zoom on fast taps; app controls have no
  iOS long-press callout.
- Reading the on-device database: avoid Dexie's `.filter()` over a whole table (it steps a cursor row
  by row); read through an index or `toArray()` and filter in JavaScript.
- iPhone doesn't blur a field when a button is tapped. A field that saves on blur also saves after a
  pause in typing and registers with `usePendingEdit`; a button that acts on saved data (Begin, Finish,
  Start) awaits `saveAllEdits()` first. Number fields select their value on tap with `selectAll`.
- A running timer lives in `useStoredState` (it survives leaving the screen or the app being closed)
  and holds `useWakeLock` so the screen stays on.
- Every screen sits in an `ErrorBoundary`: a crash shows Try again / Today / Reload, not a blank app.
- Say counts with `countOf(n, 'set')` ("1 set", "2 sets"), never a fixed plural.

## Type

Archivo Variable (display: titles, numbers, the clock) and Atkinson Hyperlegible Next Variable
(everything else), both self-hosted. Numbers use tabular figures.

## Pip

`PipSpeech` shows Pip with a speech bubble and three chips (How am I doing?, Throwback, Pep talk).
Everything he says acts out a gesture, and the words match it: a flex is about strength, a yawn about
rest, a stretch about mobility. Gestures live in `pip/everyday.css`, with coordinated paws, head, feet
and tail; the dance adds floating music notes. Each lasts 2.8 seconds (`hooks/usePipGesture.ts`), then
Pip returns to the page's pose; tapping a sleeping Pip briefly wakes him. The speech live region stays
mounted so assistive technology can announce each new line.

**What he says.** Two kinds of line, chosen by `lib/pip/voice.ts` (pure, tested):

- *Everyday lines* (`src/config/pip/moodLines.ts`, `themeLines.ts`; about 440 lines). Fourteen mood banks
  (one per pose or gesture) and nineteen topic banks (lifting, form, single-arm cable, cardio, cardio
  machines, swim, mobility, boxing, recovery, scale, cutting, food, Purdue and the CoRec, gym floor,
  mindset, goals, panda, pep). Keep each under 110 characters. Every bank is dealt like a shuffled deck
  (`lib/pipDeck.ts`), and the banks themselves come from a weighted deck (`lib/pip/pools.ts`): a lifting
  day leans on lifting and form, a cardio day on cardio, a rest day on recovery, a cut on cutting advice.
  Never the same bank twice in a row.
- *Personal lines* (`src/config/pip/personalLines.ts`, filled from your own history). `lib/pip/facts.ts`
  works out what he knows (best set per lift per day, records, streaks, weeks in a row, gaps by muscle
  group, cardio minutes, weigh-ins against your goal, today's plan); `lib/pip/moments/*` turns that into
  moments, each with a priority, a cooldown and a gesture: "two weeks ago you lifted 135 on Bench, now
  155", new records, first time over 225 (with the plates), a lift reaching your bodyweight, lighter
  and stronger, weight milestones on the way to your goal, kind words about a week that went up, a
  gentle word if it dropped very fast, comebacks, streaks, workout milestones, what's on today's board.
  A wording with `{name}` is only used when a display name is set. The same wording is used all day.

**When.** At launch he opens with the most fitting fresh moment (or an everyday line); the opening line
stays while you move between screens and is replaced when your data changes. A tap brings up one of your
own moments about 60% of the time, else an everyday line. On roughly one day in three, when there is a
workout still to do and it is before 9 pm, the first tap is a question (energy or sleep) with three quick
replies; the reply can recall what you did last time on the first lift in the plan. The chips ask for a
status (rotating between training, body and strength), a throwback, or a pep talk. What Pip has said
recently is remembered in localStorage (`fitpip.pip-voice`).

**Elsewhere.** The Weigh-in screen has a small Pip (`PipNote`) with the best thing to say about your
weight, updating as you save weigh-ins (tap him for the next thought). The workout-complete dialog adds
one line about that workout (a record set today, a milestone, a streak) when he has one.

To add a line, append it to a bank; the tests check every line is unique, short, and that each
personal wording only uses the slots it is given (see the comment above each list).

`Pip` is a layered SVG rig. Artwork and motion live in `src/components/pip/`; the head, ears,
eyes, paws, feet, tail and headband ties have separate pivots. Keep anticipation, landing and
follow-through coordinated when changing the jump timing. Idle movement includes breathing,
weight shifts, curious head tilts, glances, double blinks and occasional ear flicks. A quiet
24-second fidget cycle adds toe taps and a headband adjustment. Thinking
adds chin taps and thought dots; sleeping lowers the head into a tail blanket with slow breathing.

`usePipMotion` adds gentle pointer tracking and pauses animation when Pip leaves the viewport
or the tab is hidden. Reduced motion removes animation and particles while preserving expressive
static poses. New instances use unique gradient IDs and staggered idle timing. Test at 360px,
in both themes, with rapid taps and keyboard activation; check that each reaction returns to
idle, sleep or cheer as appropriate. The home companion renders at up to 120px; speech companions
shrink on narrow cards to keep the tip readable.

Finishing a saved workout opens `WorkoutCompletion`: a focus-trapped native dialog with a
3.2-second Pip celebration (wind-up, victory leap, rebound, shimmy, proud pose), a synchronized
sparkle burst, and the saved set count. `pip/celebrate.css` owns the character motion and
`workoutCompletion.css` owns the scene. View workout or Escape dismisses it immediately;
replay restarts the scene. The completion navigation flag is consumed after the summary loads,
so refreshing, history visits, and editing a finished workout never trigger another celebration.
Reduced motion shows the happy final pose and message immediately, without particles.
