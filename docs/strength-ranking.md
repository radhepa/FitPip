# Strength rank calibration

Reviewed 5 October 2026. Comparison group: adult recreational gym users, selected by the app owner.
This calibration changes strength/exercise and muscle ranks only. The shared ten-rank thresholds,
cardio standards, practice badges, XP, exercise catalog, saved workouts and database schema stay intact.

## What the evidence can support

There is no representative population dataset measuring every muscle or every gym exercise.
Strength Level provides the broadest usable public exercise/bodyweight tables found for this task,
with separate men's and women's results. Its users self-select into a lifting community; they may
be stronger than casual gym users, and their technique is not supervised. Treat the resulting
percentile as an estimated lifting-community comparison, not a precise probability for all adults.
The site's counts are qualifying results, not counts of independent people.
[Data and methodology](https://strengthlevel.com/strength-standards),
[submission filtering and limitations](https://strengthlevel.com/faq).

The snapshot in `src/config/strengthReferenceData.ts` records each source exercise's URL slug,
data cutoff, qualifying male/female result counts and five comparison anchors by bodyweight.
Each source is available at `https://strengthlevel.com/strength-standards/<slug>/kg`.
The source defines the five anchors as the 5th, 20th, 50th, 80th and 95th percentiles.
The 50th percentile is the median, presented as the app's familiar “average lifter” comparison.

For example, these are published median one-rep maxes, before display rounding:

| Exercise | Men, 80 kg bodyweight | Women, 65 kg bodyweight |
| --- | ---: | ---: |
| Bench press | 98 kg | 50 kg |
| Back squat | 132 kg | 76 kg |
| Deadlift | 155 kg | 90 kg |

Sources: [bench press](https://strengthlevel.com/strength-standards/bench-press/kg),
[squat](https://strengthlevel.com/strength-standards/squat/kg),
[deadlift](https://strengthlevel.com/strength-standards/deadlift/kg).

For strict bodyweight movements the tables give observed rep counts. At 80 kg, the male push-up
median is 38 reps and the male pull-up median is 13 reps. Female push-up and pull-up medians at
65 kg are 18 and 6 reps, respectively. These are exercise-specific comparisons, not interchangeable
measures of maximal force.
[Push-up tables](https://strengthlevel.com/strength-standards/push-ups/kg),
[pull-up tables](https://strengthlevel.com/strength-standards/pull-ups/kg).

## Cross-checks and research decisions

- Piper et al. provide supervised 10RM norms for 1,095 college-aged men and 371 college-aged women,
  including bench press, leg press and accessory exercises. These help establish that sex- and
  bodyweight-specific comparisons are justified. Their age range, equipment and testing protocol
  differ from the broad app population, so their values are not blended with community 1RM tables.
  [Men, 2021](https://journal.iusca.org/index.php/Journal/article/view/40),
  [women, 2022](https://journal.iusca.org/index.php/Journal/article/view/138).
- Reynolds et al. tested 1-, 5-, 10- and 20RM in 70 participants. Five-rep tests were most accurate;
  the authors advise no more than 10 reps in linear 1RM predictions for bench/leg press.
  FitPip therefore limits rep-based maximal-load estimates to 10 counted reps. Longer sets still
  count as evidence but receive a conservative estimate; this is a product decision, not a
  claim that their true maximum stops increasing after ten reps.
  [Reynolds et al., 2006](https://pubmed.ncbi.nlm.nih.gov/16937972/).
- Nuzzo et al. analyzed 269 studies and 7,289 individuals. Rep-to-maximum relationships vary
  substantially across people and exercises, especially bench versus leg press. This rules out
  precise universal high-rep conversions. A logged non-failure set can underestimate true strength;
  no speculative reps-in-reserve bonus is awarded.
  [Nuzzo et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10933212/).
- Jaric discusses body-size normalization, including a 0.67 mass exponent for measured muscle
  force. That exponent is not a validated percentile model for every gym lift. The app now uses
  actual exercise/bodyweight tables inside their published range; 0.67 is only an explicitly
  approximate load extrapolation outside the range.
  [Jaric, 2002](https://pubmed.ncbi.nlm.nih.gov/12141882/).

FitPip currently stores bodyweight and the selected comparison sex, but no height. The available
tables do not provide exercise-specific height percentiles. No height, BMI, limb-length or age
multiplier is invented. Assessment age remains recorded without adjusting these comparisons.

## Scoring implementation

1. Match the movement and equipment. Smith bench/squat, strict press/push press, conventional/sumo
   deadlift, floor/bench press and horizontal/sled leg press have separate reference tables.
   Loads for dumbbell exercises are per dumbbell; independent cable flies are per stack/arm.
   Barbell lifts include bar plus plates. Cable pulley ratios, machine leverage, and Smith/sled
   load conventions must be kept consistent with the source; the app cannot infer hardware details.
  Machine comparisons remain approximate and their badge explanation says so.
  [Source logging conventions](https://strengthlevel.com/faq).
  The dumbbell triceps-extension source demonstrates one arm overhead, so a two-handed extension
  holding one dumbbell and lying extensions do not inherit that table.
  [Source movement demonstration](https://strengthlevel.com/exercises/dumbbell-tricep-extension).
2. Interpolate each of the five anchors linearly in kg between neighboring bodyweight rows,
   independently for each comparison sex. The source supplies 50–140 kg rows for men and
   40–120 kg rows for women. Outside those bounds, load anchors use the boundary row scaled by
   bodyweight to the 0.67 power; rep anchors use the nearest boundary row. The badge identifies
   out-of-range comparisons as less certain.
3. Compare loads as estimated 1RM/bodyweight. Estimate singles exactly; use Brzycki through eight
   counted reps, a blend at nine, and Epley at ten, matching the source's documented calculator
   convention. No more than ten reps contribute to the load estimate.
4. Score unweighted bodyweight movements from the observed reps with no 60-rep ceiling.
   Interpolate in log(1 + reps) against percentile log-odds; this is an approximate quantile curve,
   not an extrapolated bodyweight 1RM. Rounded “less than one rep” entries are stored as zero.
   Tied anchors retain the upper percentile; zero performed reps stay at the bottom.
5. Weighted pull-ups, chin-ups and dips use their separate published added-load tables.
   Estimate total moved mass (bodyweight plus added load), then compare at the user's bodyweight.
   Their badge's displayed reps are a percentile-equivalent unweighted comparison. Other weighted
   bodyweight movements, and weighted sets outside the published bodyweight range, have no
   defensible conversion and do not receive a population rank.
6. Retain the existing log-performance/log-odds interpolation for loaded exercises and its bounded
   tail extrapolation. Omit rounded zero kg anchors from the logarithmic curve. Rank 10 starts at
   the existing 97th-percentile threshold, slightly above the published 95th-percentile anchor;
   its requirement is therefore an estimate. This interpolation is a model assumption.
7. Round rank requirements upward to whole reps or available plate increments, so a displayed
   requirement actually earns its advertised rank. Median display values use normal rounding.

The former approximate family multipliers for women and arbitrary fractions of two-arm cable
standards are removed. Generic step-ups, kettlebell swings, most single-arm cable lifts, assisted
movements, and unsupported machine/bodyweight variants stay unranked. Existing logs and exercise
choices remain available. No synthetic population distribution is assigned to them.
Decline dumbbell presses, reverse wrist curls, preacher/concentration curls, glute bridges,
Pendlay rows, hang cleans and power snatches also need their own movement-specific tables before
they can be ranked; generic name matches do not assign them a different movement's distribution.

## Muscle and overall ranks

Muscle ranks remain performance indicators inferred from associated lifts, not direct physiological
measurements. Only the standard's configured main muscles receive its full comparison score;
additional logged muscles are helpers. The existing best-lift rule, 80% helper-score weighting and
six-group overall average are game rules, not validated population percentiles for individual muscles.
The muscle sheet and rank explanation make that distinction explicit. Missing overall groups retain
their existing zero contribution. Height, muscle size, body composition, left/right differences,
range of motion and individual anatomy are not measured by this system.

## Verification and future updates

Calibration tests check published numbers independently, sex-specific bodyweight interpolation,
strict bodyweight reps, weighted standards, repeated zero anchors, invalid inputs, unit equivalence,
assessment integration, and every displayed rank requirement across the supported lifts,
seven bodyweights and both units. The remaining application tests check compatibility with workouts,
XP, practice and cardio behavior.

For a future snapshot, retain the source URL and data cutoff, extract only the compatible bodyweight
tables, and preserve their per-dumbbell/per-stack logging conventions. Keep observations from
different populations or protocols separate. Re-run the calibration matrix and the full test/build
checks before publishing; the live app never fetches these tables or sends workout data to the source.
