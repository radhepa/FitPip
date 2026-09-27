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

## Type

Archivo Variable (display: titles, numbers, the clock) and Atkinson Hyperlegible Next Variable
(everything else), both self-hosted. Numbers use tabular figures.

## Pip

`PipSpeech` shows Pip with a speech bubble. Lines are in `src/config/pipLines.ts` (keep 50-100,
each under 110 characters). `lib/pipDeck.ts` deals them like a shuffled deck stored in
localStorage: a new line every launch, no repeats until all have been shown. Successive taps deal
the next line and cycle through a wave with a wink, a two-hop celebration, and a hug with hearts.
Each reaction lasts 2.8 seconds, then returns to the page's pose; tapping a sleeping Pip briefly
wakes him. Repeated taps restart the reaction and its settling timer. The speech live region
stays mounted so assistive technology can announce each new line.

`Pip` is a layered SVG rig. Artwork and motion live in `src/components/pip/`; the head, ears,
eyes, paws, feet, tail and headband ties have separate pivots. Keep anticipation, landing and
follow-through coordinated when changing the jump timing. Idle movement includes breathing,
weight shifts, curious head tilts, glances, double blinks and occasional ear flicks. Thinking
adds chin taps and thought dots; sleeping lowers the head into a tail blanket with slow breathing.

`usePipMotion` adds gentle pointer tracking and pauses animation when Pip leaves the viewport
or the tab is hidden. Reduced motion removes animation and particles while preserving expressive
static poses. New instances use unique gradient IDs and staggered idle timing. Test at 360px,
in both themes, with rapid taps and keyboard activation; check that each reaction returns to
idle, sleep or cheer as appropriate. The home companion renders at up to 120px; speech companions
shrink on narrow cards to keep the tip readable.
