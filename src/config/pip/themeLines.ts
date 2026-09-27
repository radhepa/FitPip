/**
 * Pip's lines by topic. Each topic has the gesture he makes while saying them, and the app leans on
 * the ones that fit your day (a lifting day gets lifting and form tips, a cardio day gets cardio, a
 * rest day gets recovery, and so on). Every bank is dealt like a shuffled deck (lib/pip/voice.ts).
 * Keep every line under 110 characters; add freely.
 */
import type { PipMood } from '../../components/pip/types'

export type ThemeKey =
  | 'start'
  | 'lifting'
  | 'form'
  | 'singleArm'
  | 'cardio'
  | 'cardioMachines'
  | 'swim'
  | 'mobility'
  | 'boxing'
  | 'recovery'
  | 'scale'
  | 'cut'
  | 'food'
  | 'purdue'
  | 'gymFloor'
  | 'mindset'
  | 'goals'
  | 'panda'
  | 'pep'

export interface Theme {
  gesture: PipMood
  lines: readonly string[]
}

export const THEMES: Record<ThemeKey, Theme> = {
  start: {
    gesture: 'wave',
    lines: [
      "Oh hey, you're back! I was just stretching my tail.",
      'The hardest rep is opening the app. You already did it.',
      'Small steps still count. Even tiny paw-sized ones.',
      "Let's make future you say thank you.",
      "Warm up first. I'm not scooping you off the floor.",
      "Today's plan: show up, do the thing, feel smug.",
      "Five minutes. Just start with five minutes. I'll wait.",
      'You showed up. That already beats yesterday-you on the couch.',
      "Pick one thing and do it well. That's the whole secret.",
      'Consistency beats intensity. Also, snacks beat nothing. But mostly consistency.',
    ],
  },
  lifting: {
    gesture: 'flex',
    lines: [
      'Lift heavy, rest well, repeat. Easy to say, fun to do.',
      'Progressive overload: one more rep or one more plate than last time.',
      'Squats are just sitting down with ambition.',
      "The bar doesn't care about your excuses. Rude, but fair.",
      "Leave one rep in the tank. You'll need it for the stairs later.",
      "Brace your core like someone's about to poke your belly.",
      'Slow on the way down. Your muscles love the scenic route.',
      'Chalk is not a personality trait. But it is fun.',
      'Rest days are when the muscle actually shows up to work.',
      "Heavy day? I'll count. One... two... I only have little paws.",
      'Deadlift day is back-in-business day.',
      'Your only competition is last week-you. Last week-you was good. Be better.',
      'Log it or it didn’t happen. That’s the rule.',
    ],
  },
  form: {
    gesture: 'nod',
    lines: [
      'Squat cue: knees out, chest tall, sit between your hips.',
      'Bench cue: shoulder blades back and down, feet planted, bar over your wrists.',
      'Deadlift cue: bar over midfoot, back flat, push the floor away.',
      'Row cue: pull your elbow to your back pocket.',
      'Overhead press cue: squeeze your glutes and keep your ribs down. No banana back.',
      "Curl cue: elbows glued to your sides. If they move, the weight's too heavy.",
      'Pulldown cue: chest up, drive your elbows down, not your hands.',
      'Lunge cue: torso tall, front knee over your toes, back knee kisses the floor.',
      'Cable cue: step back until the stack lifts a hair, then set your stance.',
      'Breathe in at the top, brace, lift, breathe out past the sticking point.',
      'Three seconds down, one second up. Slow lowering builds more than it looks.',
      "Warm up the joint you're about to use: shoulders for presses, hips for squats.",
      'Full range of motion beats heavy half reps.',
      'Video a set now and then. Your form will tell you the truth.',
      'Row cue: think elbows, not hands. Your back does the pulling.',
      'Pallof press cue: press straight out and do not let the cable turn you.',
      'Hip thrust cue: chin tucked, ribs down, squeeze at the top for a full second.',
    ],
  },
  singleArm: {
    gesture: 'flex',
    lines: [
      'Single-arm cable rule: start with your weaker side, then match its reps on the other.',
      'One arm at a time means no hiding. Each side earns its own reps.',
      'Single-arm cable work is a core exercise in disguise. Stay square.',
      'If your torso twists, the weight is too heavy. Lighten it and stay tall.',
      'A staggered stance makes single-arm presses steadier. Try it.',
      'Weaker side first, always. The strong one can wait.',
      'Single-arm rows: squeeze your shoulder blade like you are pinching a pencil.',
      'Log each arm as its own set. Your future graphs will thank you.',
      'Cables never run out of tension. That is why single-arm work feels so honest.',
      'A single-arm pulldown lets your lat stretch further than a bar ever will.',
      'Stagger your feet, brace your abs, and let the cable do the rest.',
      'Try a slow three-count on the way back. Single-arm reps get honest fast.',
      'Match the weaker side for reps, never for weight. Then bring it up over time.',
      'Cable height matters: chest for presses, waist for rows, head for pulldowns.',
    ],
  },
  cardio: {
    gesture: 'dance',
    lines: [
      "Run like there's a free snack at the finish line.",
      "Easy runs should feel easy. If you can't talk, you're sprinting, silly.",
      'Hearts are muscles too. Give yours some reps.',
      'A slow mile is still faster than no mile.',
      'Hills are just the ground asking for a hug.',
      'Rowing: the only place going backwards counts as progress.',
      'Jump rope makes everyone feel like a boxer. Even me.',
      'Bike day! Helmet on, legs spinning, wind in your fur.',
      'Intervals: go hard, breathe, repeat. Complaining is optional.',
      'Walks count. Every step is a tiny victory lap.',
      'Take the stairs today. Tiny wins add up to big ones.',
    ],
  },
  cardioMachines: {
    gesture: 'dance',
    lines: [
      'Incline walking: 12% incline, 3 mph, 30 minutes. The treadmill has a secret.',
      'No handrails on the incline. Hold on and your glutes get to skip work.',
      'Stair climbers burn a lot in a short time. Stand tall and let go of the rails.',
      'The rower is a full-body workout: legs, then back, then arms. Reverse to return.',
      'Zone 2 is where you can talk. If you can sing, speed up. If you cannot talk, slow down.',
      'Elliptical intervals are kind to your joints and rough on your ego.',
      'Bike days are easy on your knees when the seat is at the right height.',
      'Intervals: hard for a minute, easy for two. Repeat until your legs complain politely.',
      'Sprinting once a week keeps you fast. Warm up first.',
      'Walking after meals is underrated. Ten minutes does real work.',
      'Cardio after lifting, not before, keeps your lifts strong.',
      "Don't stare at the clock. Bring a podcast.",
      'An easy 30 minutes beats a hard 10 you dread. Consistency wins the year.',
      'The stair climber is honest. Breathe, stand tall, no leaning on the rails.',
      'Cool down for five minutes. Your heart likes a gentle landing.',
    ],
  },
  swim: {
    gesture: 'bounce',
    lines: [
      'Swim day! I’ll hold your towel. I can’t swim. I was built for climbing.',
      'Long strokes, slow breaths. Glide like a sleepy otter.',
      'Pool rule number one: never skip leg day in the water either.',
      'Freestyle is free. The lane rental is not. Make it count.',
      'Every lap is a lap. Even the ones where you forgot to count.',
    ],
  },
  mobility: {
    gesture: 'stretch',
    lines: [
      'Breathe in... breathe out... okay, now hold it. The pose, not the breath.',
      "Downward dog? I'm more of a downward panda.",
      'Flexibility is a slow game. Your hamstrings are listening.',
      'Tree pose tip: pick a spot on the wall and stare at it like it owes you money.',
      "Stretch after training. Future you's back sends its regards.",
      "Savasana is still yoga. It's the best pose. I've mastered it.",
      "Don't bounce in your stretches. Just melt into them.",
      'Tight hips? Pigeon pose is calling.',
      'Mobility today, fewer creaky noises tomorrow.',
      'Warrior II: arms strong, gaze steady, legs quietly on fire.',
      'Ten minutes of mobility after a lift is the cheapest insurance there is.',
      'Tight shoulders from pressing? Doorway chest stretch, thirty seconds a side.',
    ],
  },
  boxing: {
    gesture: 'bounce',
    lines: [
      'Hands up, chin down. And keep that tail tucked.',
      "Jab, cross, hook. Then hydrate. That's my favourite combo.",
      'The heavy bag never hits back. Enjoy it while it lasts.',
      "Move your feet! Sitting ducks don't win rounds.",
      "Three minutes can feel like forever. That's how you know it's working.",
      'Boxing is dancing, but angrier.',
    ],
  },
  recovery: {
    gesture: 'yawn',
    lines: [
      'Sleep is the cheapest supplement. I take a lot of it.',
      'Water. Drink some. Right now. I’ll wait.',
      'Protein, veggies, sleep. Repeat until strong.',
      "Sore today? That's your body writing a thank-you note.",
      "Rest isn't quitting. It's loading the next level.",
      'Recovery walks are sneaky good.',
      'Some days are 100%. Some days are 40%. Both days count.',
      "Listen to your body. Unless it's asking for a sixth cookie.",
      "Missed a day? That's okay. Missing two is a pattern. Let's not.",
      'Bamboo is my protein. What’s yours?',
    ],
  },
  scale: {
    gesture: 'peekaboo',
    lines: [
      'The scale is one number, not the whole story.',
      'Weigh in at the same time each morning. The scale likes routines too.',
      'Weight goes up and down daily. Watch the trend, not the wiggle.',
      'Strength goes up even when the scale stays still. Sneaky, right?',
    ],
  },
  cut: {
    gesture: 'nod',
    lines: [
      'A cut is a marathon of small choices. You are making the small choices.',
      "Keep the weights heavy while you cut. Your muscle is the thing we're keeping.",
      'About 1 to 2 lb a week is a sweet spot. Faster costs muscle. Slower is fine too.',
      'Protein at every meal helps you keep muscle while the number goes down.',
      'Steps are the sneakiest cardio. A walk after dinner adds up fast.',
      'The scale bounces. Your trend line is the truth.',
      'Hungry is normal. Starving is not. Eat enough to lift.',
      "A treat isn't a crime. What you do across weeks is what counts.",
      'Fibre and water make a cut a lot easier. Vegetables are the closest thing to free food.',
      'Lifting tells your body to keep muscle. Cardio just widens the deficit.',
      'Short on sleep, cravings go up. Sleep more and they calm down.',
      "Don't cut on vibes. Cut with a plan. Yours lives in the Plan tab.",
      'The last few pounds take patience. You are built for patience. Panda.',
      'Two hard weeks feel like nothing in a year. Keep stacking them.',
      'Weigh yourself, then look at the average. Then close the app and go live.',
      'Cutting works best on a routine. Same lifts, same walks, same bedtime.',
    ],
  },
  food: {
    gesture: 'love',
    lines: [
      'Protein at breakfast makes the rest of the day easier.',
      'Eat a colour today. A green one counts.',
      'Water first, then the snack. Sometimes it was just thirst.',
      'Pre-workout snack: something light with carbs, about an hour before.',
      'After lifting, a meal with protein helps your muscles refuel.',
      "Eating enough is part of lifting. Muscles don't grow on air.",
      'Meal prep is a gift from Sunday-you to Thursday-you.',
      "A banana is nature's pre-workout. Panda-approved.",
      'Alcohol now and then is fine. It also nudges sleep and recovery the wrong way.',
      "Treats fit in a plan. Just keep them treats, not the whole plan.",
      'Eating slowly gives your brain time to notice it is full.',
      'A protein-and-veg plate is hard to overeat and easy to love.',
    ],
  },
  purdue: {
    gesture: 'bounce',
    lines: [
      'Boiler Up! Now go lift something.',
      "Hammer down. That's the whole plan.",
      'Purdue is the Cradle of Astronauts. A set of ten is a small step up.',
      'Neil Armstrong went to Purdue. One small step for you: walking into the CoRec.',
      'Purdue Pete swings a hammer. You swing a kettlebell. Very similar.',
      'Scifres has a slam wall. Slam balls are stress relief that also counts as cardio.',
      'The CoRec has 8 Olympic lifting platforms. A lot of platforms for one panda’s dreams.',
      'The atrium track is a nice place for a cooldown lap or three.',
      "The cycling studio has 30 spin bikes. Somebody's leg day is about to get loud.",
      'There are cables in most CoRec zones. Single-arm season lasts all year.',
      'A 30-minute CoRec session between classes still counts. Really.',
      'Finals week is a marathon. A short lift makes a very good study break.',
      'Group X classes count too. Log them and watch the minutes add up.',
      'Lower Gym turf plus cables: carries, lunges and single-arm work in one spot.',
      'Group X, F45, the pool, the climbing wall: the CoRec is a whole menu. Try something new.',
      'The CoRec is big. Go with a plan, or you will walk laps between machines.',
    ],
  },
  gymFloor: {
    gesture: 'nod',
    lines: [
      'Re-rack your weights. Future you and the next lifter both say thanks.',
      "Wipe down the bench. It's a two-second good deed.",
      'Working in between sets is polite. Camping on a machine while scrolling is not.',
      "Filming? Keep the phone off other people's sets. Be nice.",
      'Ask before you jump in. Gym people are friendly, mostly.',
      'Collars on the barbell keep the plates where you left them.',
      'Take a lighter warm-up set. Nobody is judging your plates.',
      'Heavy set done? Give the rack back. Someone is waiting politely.',
      'Use the mirror for form checks. It is also great for looking cool.',
      'Say hi to the front desk. They see everything and remember it.',
      'If you are not using it, let someone else use it. Even a bench.',
      'Bring a towel. Your future self and the bench both appreciate it.',
    ],
  },
  mindset: {
    gesture: 'love',
    lines: [
      'Motivation is a spark. Habit is the fire.',
      "You don't have to feel like it. You just have to start.",
      'Compare yourself to you from a month ago. That person had less patience.',
      'A bad workout still beats a skipped one. Every single time.',
      'Discipline is just kindness to future you.',
      'Fitness is a lifetime hobby, not a 12-week sprint.',
      "You'll never regret the workout you almost skipped.",
      'Plateaus are just the body asking for a little more time.',
      "Progress isn't a straight line. It's more of a squiggle with a point.",
      'Do it tired. Do it slow. Do it anyway.',
      'Nobody is watching. That is the freedom of it.',
      'Some weeks you build. Some weeks you maintain. Both are progress.',
      'Habits beat plans. Keep the habit small enough to survive a bad day.',
    ],
  },
  goals: {
    gesture: 'think',
    lines: [
      'Write down one goal for this month. Specific beats vague every time.',
      "'Get stronger' is a wish. 'Bench 155 for five' is a goal.",
      "Track something that isn't the scale: reps, minutes, how your jeans fit.",
      'Non-scale wins count: energy, sleep, stairs without the huffing.',
      "Big goals need small deadlines. What's the one for this week?",
      'Celebrate the checkpoints, not just the finish line.',
      "A goal you can see is a goal you'll chase. Keep yours somewhere visible.",
      'Set the goal, then build the habit. The habit does the heavy lifting.',
      'If the goal feels too big, cut it in half. Then in half again.',
      "You can change your goal. That's not quitting, that's steering.",
    ],
  },
  panda: {
    gesture: 'love',
    lines: [
      'I train by climbing trees. It counts as leg day, arm day and everything day.',
      'Bamboo salad for lunch, bamboo shake for dinner. I have range.',
      'My tail is 40% of my personality. The rest is snacks.',
      'I once tried to spot someone. I ended up under the bar. Never again.',
      'The secret to my physique: naps, snacks and a very supportive tail.',
      "I don't have a gym bag. I have a gym tail.",
      'Whenever I hear plates clank, I do a little happy wiggle.',
      'Some pandas stretch. Some pandas nap. The best pandas do both, in that order.',
      "I can't do a pull-up, but I can hold on to a branch for a very long time.",
      "My headband isn't for sweat. It's for style.",
      "I'm not saying I'm the mascot of your gains, but I am.",
      "One day I'll lift a bamboo stalk over my head. Today is not that day.",
    ],
  },
  pep: {
    gesture: 'bounce',
    lines: [
      "You're stronger than you were last month. I checked. Okay, I guessed. But I believe it.",
      'Nobody ever regretted a workout. Well, maybe burpees. But not really.',
      "I'd high-five you, but my arms are very short.",
      'Tail wags for every set you finish.',
      "Today's forecast: 100% chance of gains.",
      "If you need me, I'll be here. Motivating. Adorably.",
      "Let's go! Or, you know, let's stretch and then go.",
      "Muscles don't grow in the gym. They grow on the couch afterwards. Earn the couch.",
      "You're not behind. You're exactly where you started, plus everything you did since.",
      'Fun fact: I train by climbing curtains. You have a gym. Lucky.',
      "Deep breath. Shoulders down. You've got this.",
      'Be the kind of tired that feels good.',
      "Personal record day? I've got my party hat on.",
      'Every champion was once a beginner who kept showing up.',
      'Some reps are ugly. They still count.',
      "Earn the snooze. Then snooze. That's balance.",
      'Plans are nice. Doing the plan is nicer.',
      'Mix it up! Lift, swim, stretch, box. Bodies love variety.',
      'Three things today: move, eat something green, go to bed on time.',
      "You versus you. That's the only match that matters.",
      "Don't count the days. Make the days count. I stole that one.",
      'Consistency is boring. Boring is powerful.',
      'One more set? One more set.',
    ],
  },
}

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[]
