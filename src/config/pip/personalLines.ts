/**
 * Pip's personal lines: templates with {slots} that lib/pip/moments fills in from your own
 * history. Each list has several wordings and the same one is used all day, a different one
 * tomorrow. A wording with {name} is only used when a display name is set (Settings), so keep at
 * least one wording per list without it. Slots are written next to each list. Keep filled-in lines
 * around 150 characters or less.
 */

// ---- Lifts -----------------------------------------------------------------------------------

/** A new record. {lift} {w} {reps} {unit} {prevW} {prevReps} {when} ("today", "yesterday"...) {When} */
export const RECORD_LINES: readonly string[] = [
  'New best on {lift}: {w} {unit} × {reps}. Your old best was {prevW} × {prevReps}. Look at you.',
  "{lift} PR! {w} × {reps}. I'd hug you, but I'm fourteen inches tall.",
  'Last best on {lift}: {prevW} × {prevReps}. Now: {w} × {reps}. That is the whole game.',
  '{When} you hit {w} × {reps} on {lift}. Record books updated, tail wagging.',
  '{name}, {lift} went from {prevW} to {w} {unit}. Somebody call the plates.',
]

/** A new best in reps for a bodyweight move. {lift} {reps} {prevReps} {When} */
export const RECORD_REPS_LINES: readonly string[] = [
  'New best on {lift}: {reps} reps. Your old best was {prevReps}. Strong.',
  '{lift}: {prevReps} reps, then {reps}. Up and up.',
  '{When} you did {reps} {lift}. That beats your old {prevReps}. Nicely pulled.',
]

/** Weight lifted, then and now. {Ago} {ago} {lift} {w1} {r1} {w2} {r2} {unit} {diff} */
export const WEEKS_AGO_LINES: readonly string[] = [
  '{Ago}, you lifted {w1} {unit} on {lift}. Now you lift {w2}. That is +{diff} {unit}!',
  '{Ago} your top {lift} set was {w1} × {r1}. Today: {w2} × {r2}. Who is this lifter?',
  'Back {ago} you did {lift} at {w1}. Now it is {w2}. The trend is your friend.',
  '{Ago}: {w1} on {lift}. Now: {w2}. I have been keeping notes. Good ones.',
  "{name}, {ago} you used to lift {w1} {unit} on {lift}. Now it's {w2}. Look at that climb.",
]

/** Since the first time you did a lift. Same slots as WEEKS_AGO_LINES, plus {span} ("a month"). */
export const SINCE_START_LINES: readonly string[] = [
  '{Ago}, you opened {lift} at {w1} {unit} × {r1}. Now you are at {w2} × {r2}. That is +{diff}!',
  'Remember {ago}? {lift} started at {w1} {unit}. Today it is {w2}. Not bad for someone with a snack schedule.',
  '{lift}: {w1} → {w2} {unit}. That is what {span} of showing up looks like.',
  '{name}, {ago} your {lift} was {w1}. Now it is {w2}. Future you says thanks.',
]

/** Bodyweight reps then and now. {Ago} {ago} {lift} {r1} {r2} {diff} */
export const REPS_STORY_LINES: readonly string[] = [
  '{Ago}, you did {r1} {lift}. Now you do {r2}. That is +{diff}!',
  '{lift}: {r1} reps {ago}, {r2} now. Gravity is losing.',
  '{name}, {r2} {lift} today versus {r1} {ago}. Look at you go.',
]

/** A lift that has sat still. {lift} {w} {reps} {unit} {weeks} {jump} ("2.5 lb") */
export const STALL_LINES: readonly string[] = [
  '{lift} has sat at {w} {unit} for {weeks} weeks. Try one more rep before adding weight.',
  '{lift} has been at {w} for {weeks} weeks. Add {jump} and see. Small jumps still count.',
  'Stuck on {lift} at {w} {unit}? Try a slower lowering, a longer rest, or a two-second pause at the bottom.',
]

/** Your heaviest lift so far. {lift} {w} {reps} {unit} {ago} */
export const HEAVIEST_LINES: readonly string[] = [
  "Heaviest {lift} so far: {w} {unit} × {reps}, {ago}. Beat it whenever you're ready.",
  'Your {lift} record is {w} × {reps} from {ago}. It is lonely up there. Keep it company.',
]

/** First time over a plate milestone. {lift} {w} {unit} {plates} ("two plates a side") */
export const PLATE_LINES: readonly string[] = [
  'First time over {w} on {lift}! That is {plates}. Ask me how proud I am.',
  '{lift} just crossed {w} {unit}: {plates}. New neighbourhood.',
]

/** First time over a round number. {lift} {w} {unit} */
export const ROUND_LINES: readonly string[] = [
  '{lift} just crossed {w} {unit}. New neighbourhood.',
  'First time over {w} on {lift}. I saved the good confetti for this.',
]

/** A lift reached a multiple of bodyweight. {lift} {mult} ("your bodyweight") {w} {unit} */
export const BODYWEIGHT_LINES: readonly string[] = [
  'Your {lift} passed {mult}: {w} {unit}. That is a real milestone.',
  '{lift} at {mult}. Not everyone gets there. You did.',
]

/** Lighter and stronger. {lift} {lost} {unit} {gained} {then} {now} */
export const RECOMP_LINES: readonly string[] = [
  'Down {lost} {unit} and your {lift} is up {gained} {unit}. Bar-to-bodyweight: {then}× → {now}×. That is recomposition.',
  'The scale is down {lost} {unit} and {lift} is up {gained} {unit}. Stronger and lighter. Rare combo, well done.',
  "{name}, you're lighter by {lost} {unit} and {lift} climbed {gained} {unit}. That is the dream.",
]

/** Lifetime volume. {total} {unit} {thing} ("about 3 grand pianos") */
export const VOLUME_LINES: readonly string[] = [
  "You've lifted {total} {unit} in total. That is {thing}.",
  'Lifetime volume: {total} {unit}. Roughly {thing}. I did the maths, then a little nap.',
]

/** Your most-logged lift. {lift} {n} */
export const FAVOURITE_LINES: readonly string[] = [
  "Your most-logged lift: {lift} ({n} sets). I'm sensing a favourite.",
  '{lift} again? {n} sets so far. It is clearly your love language.',
]

/** Single-arm work. {n} */
export const SINGLE_ARM_LINES: readonly string[] = [
  '{n} single-arm sets logged. Your weaker side just got a personal trainer.',
  'Single-arm work: {n} sets so far. Even sides are built one rep at a time.',
  '{name}, {n} single-arm sets in the log. That is a lot of honest reps.',
]

// ---- Habits ----------------------------------------------------------------------------------

/** {n} */
export const STREAK_LINES: readonly string[] = [
  '{n} days in a row. Streaks are basically superpowers.',
  '{n}-day streak! A rest day soon is allowed, and smart.',
  '{name}, {n} days straight. That is not luck. That is you.',
]

/** {n} {min} */
export const WEEK_STREAK_LINES: readonly string[] = [
  '{n} weeks in a row with {min}+ workouts. That is a habit now.',
  '{n} straight weeks of showing up. Consistency is the boring superpower.',
]

/** {n} */
export const WORKOUT_MILESTONE_LINES: readonly string[] = [
  "Workout number {n}! I'm not crying, my headband is just damp.",
  '{n} workouts in the books. Small numbers become big ones by doing exactly this.',
  '{name}, that is workout {n}. Keep stacking them.',
]

/** {days} {last} */
export const COMEBACK_LINES: readonly string[] = [
  "It's been {days} days since {last}. No guilt. A ten-minute start counts.",
  'Welcome back! {days} days away is nothing. Start light, finish proud.',
  '{name}, you are back after {days} days. That takes more guts than never leaving.',
]

/** Back after two weeks or more. {days} */
export const LONG_BREAK_LINES: readonly string[] = [
  '{days} days away. Ease back in: about half the weight, all the attention.',
  'Welcome back! After {days} days, your first session is just a hello. Keep it easy.',
]

/** {ago} {n} */
export const FIRST_WORKOUT_LINES: readonly string[] = [
  'Your first workout was {ago}. Since then: {n} workouts. Tiny paw prints turn into a trail.',
  '{Ago} you logged workout number one. You are at {n} now. That is called a habit.',
]

/** A muscle group that has been quiet. {Group} {group} {days} */
export const GAP_LINES: readonly string[] = [
  '{Group}: {days} days since you trained them. They are starting to miss you.',
  "Haven't seen {group} in {days} days. Add one exercise today?",
  '{name}, your {group} are overdue by {days} days. Ask me how I know.',
]

/** {done} {planned} {left} */
export const WEEK_LINES: readonly string[] = [
  '{done} of {planned} planned days done this week. {left} to go, and I believe in you.',
  'Week check: {done}/{planned} done. Keep the rhythm.',
]

/** {planned} */
export const WEEK_DONE_LINES: readonly string[] = [
  'All {planned} planned days done this week! Rest up, you earned it.',
  'Every planned day this week is done. That is how weeks are won.',
]

// ---- Today -----------------------------------------------------------------------------------

/** {names} {minutes}. Wordings with {minutes} are only used when the plan has exercises to add up. */
export const PLAN_LINES: readonly string[] = [
  "Today's lineup: {names}. About {minutes} minutes. I'll hold your towel.",
  'On the board: {names}. Roughly {minutes} minutes. Easy.',
  '{name}, today is {names}. Warm up, then go.',
  "Today's lineup: {names}. I'll hold your towel.",
  'On the board: {names}. Warm up first, then go.',
]

/** Some of today's plan is done. {names} {done} {total} */
export const PLAN_PARTIAL_LINES: readonly string[] = [
  '{done} of {total} down today. {names} is next.',
  'Nice start, {name}! {names} is still waiting.',
]

/** {sets} */
export const DONE_LINES: readonly string[] = [
  "One workout in the books today: {sets} sets. Eat, stretch, sleep. That's the second half of training.",
  "Today's done! {sets} sets. Now the real work: food, water, sleep.",
  'Nice work today, {name}. Your muscles are rebuilding as we speak.',
]

export const REST_LINES: readonly string[] = [
  "Rest day. Sleep, eat well, walk a little. Muscles grow while you're lounging.",
  "Nothing planned today, and that's the plan. Enjoy it.",
  'Recovery day for {name}. Hydrate, stretch, maybe a walk.',
]

export const UNPLANNED_LINES: readonly string[] = [
  'Nothing planned yet. Two minutes in the Plan tab saves a week of dithering.',
  'No plan this week? Even a rough one helps. Try the Plan tab.',
]

// ---- Weight ----------------------------------------------------------------------------------

/** No weigh-ins yet. */
export const NO_WEIGH_INS_LINES: readonly string[] = [
  "Weigh in once and I'll start tracking your trend.",
  'No weigh-ins yet. One tap on the Weigh-in tab gives us a starting line.',
]

/** First weigh-in, no goal. {w} {unit} */
export const WEIGHT_FIRST_LINES: readonly string[] = [
  '{w} {unit} on the scale. That is day one of your trend. Weigh in again tomorrow?',
  'Day one: {w} {unit}. One number is a dot. Two is a line. Keep going.',
]

/** First weigh-in with a goal. {w} {unit} {goal} {left} */
export const WEIGHT_FIRST_GOAL_LINES: readonly string[] = [
  '{w} {unit} today. {goal} is the goal: {left} {unit} to go, one weigh-in at a time.',
  'Starting at {w} {unit}, heading for {goal}. That is {left} {unit}. We do it a day at a time.',
  "{name}, {left} {unit} to {goal}. You don't need to do it today. Just do today.",
]

/** {left} {unit} {goal} {pct} {since} */
export const TO_GO_LINES: readonly string[] = [
  '{left} {unit} to go until {goal}. You are {pct}% of the way there.',
  "You've come {since} {unit} already. {left} to go until {goal}.",
  'Only {left} {unit} left to {goal}. Keep the routine and the rest takes care of itself.',
]

/** Crossing 25, 50, 75 and 90 percent of the way. {goal} {left} {unit} */
export const GOAL_QUARTER_LINES: readonly string[] = [
  'A quarter of the way to {goal}. The first quarter is the hardest to believe.',
  '25% of the way to {goal}. The path exists. You are on it.',
]
export const GOAL_HALF_LINES: readonly string[] = [
  'Halfway to {goal}! Everything from here is downhill. Metaphorically.',
  '50% there. {left} {unit} to {goal}. You are already past the hard part: starting.',
]
export const GOAL_THREE_QUARTER_LINES: readonly string[] = [
  'Three quarters of the way to {goal}. The finish line is in view.',
  '75% done, {left} {unit} left. Stay boring. Boring works.',
]
export const GOAL_NEARLY_LINES: readonly string[] = [
  'Ninety percent there. {left} {unit} to {goal}. You could jog it.',
  'So close to {goal}. {left} {unit} left. Do not change a thing.',
]

/** Down over the week, at a steady pace. {x} {unit} {avg} */
export const DOWN_WEEK_LINES: readonly string[] = [
  'Down {x} {unit} this week. That is a steady pace. Slow and sustainable is the good kind.',
  '{x} {unit} lighter than last week. Your 7-day average is {avg}: that is the number to trust.',
  "Down {x} {unit} on the week. Keep lifting heavy so it's fat you're losing, not muscle.",
]

/** Down quickly. {x} {unit} */
export const DOWN_FAST_LINES: readonly string[] = [
  'Down {x} {unit} in a week is quick. Eat enough to lift, and keep protein up: muscle is what we are keeping.',
  '{x} {unit} in a week is fast. Fuel your workouts and sleep well, so the loss stays fat, not strength.',
]

/** Up over the week, while cutting. {x} {unit} {avg} */
export const UP_WEEK_LINES: readonly string[] = [
  'Up {x} {unit} since last week. Water, salt, a hard leg day or a big dinner can do that. Watch the average, not the wiggle.',
  "The scale is up {x} {unit}. It happens. Your trend is what counts, and it's built from many days.",
]

/** No real change for about two weeks while cutting. */
export const FLAT_LINES: readonly string[] = [
  'Flat for about two weeks. Plateaus happen. Try one small change: 2,000 more steps or one fewer snack.',
  'The scale has been still for two weeks. Give it a little more time, then nudge one habit.',
]

/** {w} {unit} */
export const NEW_LOW_LINES: readonly string[] = [
  'New low: {w} {unit}! Lowest weigh-in yet.',
  '{w} {unit}, your lowest yet. The line goes down and the panda goes up.',
]

/** {goal} {unit} */
export const GOAL_REACHED_LINES: readonly string[] = [
  '{goal} {unit}! You did it. Hold here, or set a new goal? I vote for a victory nap.',
  'Goal weight reached: {goal} {unit}. Every single weigh-in got you here.',
]

/** Heading up. {x} {unit} {goal} */
export const GAIN_LINES: readonly string[] = [
  'Up {x} {unit} since you started, heading for {goal}. Slow and steady, with the bar going up too.',
  '{x} {unit} gained so far. Keep the lifts climbing and let the food do its job.',
]

/** {days} */
export const STALE_WEIGH_LINES: readonly string[] = [
  "It's been {days} days since your last weigh-in. One number, no drama. Step on?",
  '{days} days without the scale. A weigh-in keeps your trend honest.',
]

export const NO_GOAL_LINES: readonly string[] = [
  "Set a goal weight and I'll count down with you. It's on the Weigh-in tab.",
  'Pick a goal weight in the Weigh-in tab. Even a rough one gives us something to aim at.',
]

/** {ago} {dir} ("down"/"up") {x} {unit} */
export const SINCE_WEIGH_LINES: readonly string[] = [
  'Since your first weigh-in {ago}, you are {dir} {x} {unit}.',
  '{Ago} you started weighing in. Now: {dir} {x} {unit}.',
]

/** {avg} {unit} */
export const TREND_LINES: readonly string[] = [
  'Your 7-day average is {avg} {unit}. That is the number to trust, not any single morning.',
]

// ---- Cardio ----------------------------------------------------------------------------------

/** Under 150 minutes. {min} {left} */
export const CARDIO_WEEK_LINES: readonly string[] = [
  "That's {min} minutes of cardio this week. The usual goal is 150. {left} to go.",
  '{min} cardio minutes so far this week. {left} more gets you to 150.',
]

/** 150 minutes or more. {min} */
export const CARDIO_WEEK_DONE_LINES: readonly string[] = [
  '{min} cardio minutes this week: past the 150 most guidelines suggest. Victory lap!',
  '{min} minutes of cardio this week. Your heart says thank you.',
]

/** {dist} {ago} */
export const LONGEST_RUN_LINES: readonly string[] = [
  'Longest run so far: {dist}, {ago}. Your legs remember.',
  'Your longest run is {dist} from {ago}. Waiting for someone to beat it.',
]

/** {dist} {n} */
export const CARDIO_MONTH_LINES: readonly string[] = [
  'This month: {dist} on foot across {n} cardio sessions.',
  '{dist} covered in the last 30 days. Every mile is a small yes.',
]

// ---- Greetings -------------------------------------------------------------------------------

export const MORNING_LINES: readonly string[] = [
  'Good morning, {name}! Coffee, water, then iron.',
  'Morning! An early lift is a great way to feel smug all day.',
  'Morning, {name}. A breakfast with protein makes the whole day easier.',
]
export const AFTERNOON_LINES: readonly string[] = [
  'Afternoon! A lunch-break lift is a fine use of a lunch break.',
  'Afternoon, {name}. Halfway through the day is a good time to move.',
  'Afternoon slump? A brisk walk beats another coffee.',
]
export const EVENING_LINES: readonly string[] = [
  'Evening, {name}! Fresh legs or tired ones, showing up counts.',
  'Good evening! Warm up a little longer at night. Muscles stiffen after a day of sitting.',
  'Evening! A short session now still counts. So does a walk.',
]
export const NIGHT_LINES: readonly string[] = [
  'Late session? Keep it short and get to bed on time. Sleep is where the gains file.',
  'Night owl mode, {name}. Lights low, effort moderate, bedtime soon.',
]
export const LATE_LINES: readonly string[] = [
  'Up this late? Sleep is the best supplement. I would like you to have some.',
  "It's very late. Whatever you're up to, water and sleep are next.",
]

/** By weekday (0 = Sunday). */
export const WEEKDAY_LINES: Record<number, readonly string[]> = {
  0: ['Sunday. Prep the week: a plan and a grocery list are half of it.'],
  1: ["Monday: International Chest Day. It's tradition. Nobody knows who started it."],
  2: ['Tuesday. Nobody skips a Tuesday. Or if they do, they log it as recovery.'],
  3: ['Wednesday: the middle of the week. Perfect time for a big session.'],
  4: ['Thursday: almost Friday. A good workout makes the weekend taste better.'],
  5: ['Friday! Finish the week strong, then rest guilt-free.'],
  6: ['Saturday. Weekend warrior mode, or weekend recovery mode. Both are valid.'],
}

// ---- Pep talk --------------------------------------------------------------------------------

/** {n} {unit} {goal} {left} */
export const PEP_GOAL_LINES: readonly string[] = [
  "{left} {unit} to {goal}. You don't need to do it today. Just do today.",
  'Everything you log is a vote for the person who reaches {goal}. Vote today.',
]

/** {n} */
export const PEP_STREAK_LINES: readonly string[] = [
  "{n} days strong. Don't overthink it. One more.",
  'A streak is just a lot of small decisions in a row. You are on decision {n}.',
]

/** {lift} {gain} {unit} {span} */
export const PEP_LIFT_LINES: readonly string[] = [
  'Your {lift} is up {gain} {unit} in {span}. That is not luck. That is you.',
  '{lift} +{gain} {unit} over {span}. Keep going. It gets addictive.',
]

export const PEP_GENERAL_LINES: readonly string[] = [
  "Every set you log is a vote for the person you're becoming.",
  'You did not come this far to only come this far.',
  'Tired is allowed. Quitting is optional. A short workout still counts.',
  'You have never regretted a workout. I have checked. Twice.',
  'Show up now, feel great later. It is the best deal in town.',
]
