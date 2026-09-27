// Bodyweight and TRX, core and holds, carries and sleds, and the metabolic conditioning lifts
// (slam ball, wall ball, complexes) that burn a lot while you keep your strength.
import { activity, eachSide, holds, lifts, type CatalogEntry } from './entry.ts'

const bw = lifts('bodyweight')
const trx = lifts('other')
const held = holds('bodyweight')
const oneLeg = eachSide(bw, 'leg')

export const BODYWEIGHT: CatalogEntry[] = [
  // Pulling
  bw('Pull-Up (Neutral Grip)', ['lats'], ['biceps', 'upper_back', 'forearms'], [
    'Hang from parallel handles with your palms facing each other.',
    'Pull your chest toward the bar, then lower to a full hang.',
  ]),
  bw('Wide-Grip Pull-Up', ['lats'], ['upper_back', 'biceps'], [
    'Hang with your hands wider than your shoulders.',
    'Pull your chest toward the bar, then lower to a full hang.',
  ]),
  bw('Weighted Pull-Up', ['lats'], ['biceps', 'upper_back'], [
    'Hang from the bar with a belt or a dumbbell between your feet.',
    'Pull your chin over the bar, then lower fully. Log the added weight (0 for bodyweight).',
  ]),
  bw('Weighted Chin-Up', ['lats', 'biceps'], ['upper_back'], [
    'Hang with an underhand grip and a belt or dumbbell for the added weight.',
    'Pull your chin over the bar, then lower fully. Log the added weight (0 for bodyweight).',
  ]),
  bw('Weighted Dip', ['triceps', 'chest'], ['front_delts'], [
    'Support yourself on parallel bars with a belt or dumbbell for the added weight.',
    'Lower until your elbows reach about 90 degrees, then press up. Log the added weight (0 for bodyweight).',
  ]),
  bw('Inverted Row', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'abs'], [
    'Lie under a low bar or rack and hang from it with your body in a straight line.',
    'Pull your chest to the bar, squeeze, then lower fully.',
  ]),
  trx('TRX Row', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'abs'], [
    'Hold the handles and lean back with your body in a straight line.',
    'Pull your chest to your hands, squeeze, then lower. Walking your feet forward makes it harder.',
  ]),
  // Pushing
  bw('Incline Push-Up', ['chest'], ['front_delts', 'triceps'], [
    'Put your hands on a bench or rail with your body in a straight line.',
    'Lower your chest to the edge, then press back up.',
  ]),
  bw('Decline Push-Up', ['chest', 'front_delts'], ['triceps', 'abs'], [
    'Put your feet on a bench with your hands on the floor and your body straight.',
    'Lower your chest to the floor, then press back up.',
  ]),
  bw('Diamond Push-Up', ['triceps', 'chest'], ['front_delts'], [
    'Make a diamond with your thumbs and index fingers under your chest.',
    'Lower with your elbows close to your sides, then press up.',
  ]),
  bw('Pike Push-Up', ['front_delts'], ['triceps', 'chest', 'upper_back'], [
    'Start in a downward dog with your hips high.',
    'Bend your elbows to lower your head toward the floor, then press back up.',
  ]),
  bw('Archer Push-Up', ['chest'], ['triceps', 'front_delts', 'obliques'], [
    'Take a wide push-up stance with your arms out to the sides.',
    'Lower toward one hand while the other arm stays straight, then press back. Alternate sides.',
  ]),
  bw('Bench Dip', ['triceps'], ['chest', 'front_delts'], [
    'Put your hands on a bench behind you with your legs out in front.',
    'Lower until your elbows reach about 90 degrees, then press up.',
  ]),
  trx('TRX Push-Up', ['chest'], ['front_delts', 'triceps', 'abs'], [
    'Hold the handles low with your body in a plank.',
    'Lower your chest between your hands, then press back up.',
  ]),
  trx('TRX Chest Fly', ['chest'], ['front_delts', 'abs'], [
    'Lean forward on the handles with your arms out wide and a soft elbow bend.',
    'Bring your hands together in front of you, then open back up slowly.',
  ]),
  trx('TRX Y-Fly', ['rear_delts', 'upper_back'], ['traps', 'side_delts'], [
    'Face the anchor, lean back and hold the handles with your arms straight down.',
    'Pull your arms up and out into a Y, then lower slowly.',
  ]),
  trx('TRX Face Pull', ['rear_delts'], ['upper_back', 'traps'], [
    'Lean back holding the handles with your palms facing each other.',
    'Pull the handles toward your ears with your elbows high, then extend.',
  ]),
  trx('TRX Biceps Curl', ['biceps'], ['forearms'], [
    'Lean back holding the handles with your palms up and your elbows in front of you.',
    'Curl your hands toward your forehead, then extend slowly.',
  ]),
  trx('TRX Triceps Extension', ['triceps'], ['front_delts', 'abs'], [
    'Lean forward with your hands at forehead height and your elbows in front.',
    'Extend your arms until straight, then bend slowly.',
  ]),
  // Legs and glutes
  bw('Bodyweight Squat', ['quads', 'glutes'], ['hamstrings', 'calves'], [
    'Stand with your feet shoulder-width apart and reach your arms forward.',
    'Sit down until your thighs are parallel, then stand tall.',
  ]),
  bw('Reverse Lunge', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Step one foot back and lower your back knee toward the floor.',
    'Push through your front foot to stand, then alternate legs.',
  ]),
  bw('Lateral Lunge', ['quads', 'glutes', 'adductors'], ['hamstrings'], [
    'Step wide to one side and sit back into that hip, keeping the other leg straight.',
    'Push off to return, then alternate sides.',
  ]),
  bw('Curtsy Lunge', ['glutes', 'quads'], ['adductors', 'abductors'], [
    'Step one foot behind and across the other and lower your back knee.',
    'Push back up to standing, then alternate legs.',
  ]),
  bw('Box Step-Up', ['quads', 'glutes'], ['hamstrings', 'calves'], [
    'Put one foot fully on a box or bench.',
    'Drive through that heel to stand tall, then step down with control. Alternate legs.',
  ]),
  bw('Skater Squat', ['quads', 'glutes'], ['abductors', 'hamstrings'], [
    'Stand on one leg and reach your other foot behind you.',
    'Lower your back knee toward the floor, then stand. Log each leg as its own set.',
  ]),
  bw('Glute Bridge', ['glutes'], ['hamstrings', 'lower_back'], [
    'Lie on your back with your knees bent and your feet flat.',
    'Drive your hips up, squeeze your glutes at the top, then lower slowly.',
  ]),
  oneLeg('Single-Leg Glute Bridge', ['glutes'], ['hamstrings', 'abs'], [
    'Lie on your back with one foot flat and the other leg extended.',
    'Drive your hips up without letting them tilt, squeeze, then lower slowly.',
  ]),
  bw('Frog Pump', ['glutes'], ['adductors'], [
    'Lie on your back with the soles of your feet together and your knees out.',
    'Drive your hips up and squeeze your glutes, then lower slowly.',
  ]),
  bw('Nordic Hamstring Curl', ['hamstrings'], ['glutes', 'calves'], [
    'Kneel with your ankles anchored and your body straight from the knees.',
    'Lower your torso forward as slowly as you can, catch yourself, then pull back up.',
  ]),
  bw('Glute-Ham Raise', ['hamstrings', 'glutes'], ['lower_back', 'calves'], [
    'Lock your feet in the machine with your hips just past the pad.',
    'Lower your torso, then curl back up with your hamstrings and glutes.',
  ]),
  bw('Back Extension (Bodyweight)', ['lower_back'], ['glutes', 'hamstrings'], [
    'Set the pad at your hips and cross your arms over your chest.',
    'Lower your torso, then raise it until your body is straight. Do not overarch.',
  ]),
  bw('Superman', ['lower_back', 'glutes'], ['rear_delts', 'hamstrings'], [
    'Lie face down with your arms overhead.',
    'Lift your arms and legs off the floor together, hold a second, then lower.',
  ]),
  bw('Bodyweight Calf Raise', ['calves'], [], [
    'Stand on the edge of a step with the balls of your feet on it.',
    'Rise as high as you can, pause, then lower to a full stretch.',
  ]),
  oneLeg('Single-Leg Calf Raise', ['calves'], [], [
    'Stand on one foot on the edge of a step and hold a rail for balance.',
    'Rise as high as you can, pause, then lower to a full stretch.',
  ]),
]

export const CORE_AND_HOLDS: CatalogEntry[] = [
  held('Plank', ['abs'], ['front_delts', 'glutes'], [
    'Rest on your forearms with your body in one straight line.',
    'Squeeze your glutes and brace your abs. Stop when your hips start to sag.',
  ]),
  held('Hollow Body Hold', ['abs'], ['quads'], [
    'Lie on your back, press your lower back into the floor and lift your shoulders and legs.',
    'Hold with your arms overhead. Bend your knees if your back arches.',
  ]),
  held('L-Sit Hold', ['abs', 'triceps'], ['front_delts', 'quads'], [
    'Support yourself on parallel bars or blocks with your legs straight out in front.',
    'Press down tall and hold. Tuck your knees if you cannot keep your legs straight.',
  ]),
  held('Dead Hang', ['forearms', 'lats'], ['biceps'], [
    'Hang from a pull-up bar with your arms straight and your shoulders active.',
    'Hold as long as you can with steady breathing. Great for grip and shoulders.',
  ]),
  held('Wall Sit', ['quads'], ['glutes', 'calves'], [
    'Lean your back on a wall and slide down until your thighs are parallel.',
    'Keep your knees over your ankles and hold.',
  ]),
  held('Copenhagen Plank', ['adductors', 'obliques'], ['abs'], [
    'Set up in a side plank with your top leg resting on a bench.',
    'Lift your hips and hold. Log each side as its own set.',
  ]),
  bw('Dead Bug', ['abs'], ['obliques', 'quads'], [
    'Lie on your back with your arms up and your knees over your hips.',
    'Lower the opposite arm and leg while pressing your lower back into the floor, then alternate.',
  ]),
  bw('Bird Dog', ['lower_back', 'glutes'], ['abs', 'rear_delts'], [
    'Start on hands and knees with your back flat.',
    'Reach the opposite arm and leg out, hold a second, then switch.',
  ]),
  bw('Hanging Knee Raise', ['abs'], ['forearms', 'quads'], [
    'Hang from a bar and brace your core.',
    'Raise your knees to your chest without swinging, then lower slowly.',
  ]),
  bw('Toes-to-Bar', ['abs'], ['lats', 'forearms'], [
    'Hang from a bar and brace your core.',
    'Raise your straight legs until your toes touch the bar, then lower with control.',
  ]),
  bw('V-Up', ['abs'], ['quads'], [
    'Lie flat with your arms overhead.',
    'Lift your straight legs and torso together to touch your toes, then lower slowly.',
  ]),
  bw('Bicycle Crunch', ['abs', 'obliques'], [], [
    'Lie on your back with your hands by your head and your legs raised.',
    'Bring one elbow toward the opposite knee while extending the other leg, then alternate.',
  ]),
  bw('Flutter Kicks', ['abs'], ['quads'], [
    'Lie on your back with your legs straight and your lower back pressed down.',
    'Kick your legs up and down in short, quick strokes.',
  ]),
  bw('Reverse Crunch', ['abs'], ['obliques'], [
    'Lie on your back with your knees over your hips.',
    'Curl your hips off the floor toward your ribs, then lower slowly.',
  ]),
  bw('Decline Sit-Up', ['abs'], ['quads'], [
    'Hook your feet under the pads of a decline bench.',
    'Curl up to sitting, then lower slowly. Hold a plate on your chest to make it harder.',
  ]),
]

export const CARRIES_AND_SLEDS: CatalogEntry[] = [
  lifts('dumbbell')("Farmer's Carry", ['forearms', 'traps'], ['abs', 'glutes', 'obliques'], [
    'Pick up a heavy dumbbell in each hand and stand tall.',
    'Walk with quick, controlled steps. Log the weight in each hand and count each length as a rep.',
  ]),
  eachSide(lifts('dumbbell'), 'side')('Suitcase Carry', ['obliques', 'forearms'], ['traps', 'glutes', 'abs'], [
    'Hold one heavy dumbbell at your side and stay perfectly upright.',
    'Walk without leaning toward the weight. Log the weight and count each length as a rep.',
  ]),
  eachSide(lifts('kettlebell'), 'side')('Single-Arm Overhead Carry', ['front_delts', 'abs'], ['obliques', 'traps', 'triceps'], [
    'Press a kettlebell overhead and lock your elbow.',
    'Walk with your ribs down and the bell stacked over your shoulder. Log the weight and count each length as a rep.',
  ]),
  lifts('kettlebell')('Front-Rack Carry', ['abs', 'upper_back'], ['front_delts', 'quads'], [
    'Hold one or two kettlebells at your shoulders with your elbows tucked.',
    'Walk tall and steady. Log the weight and count each length as a rep.',
  ]),
  lifts('barbell')('Trap Bar Carry', ['traps', 'forearms'], ['glutes', 'quads', 'abs'], [
    'Stand inside the hex bar, pick it up and stand tall.',
    'Walk with short steps. Log the weight and count each length as a rep.',
  ]),
  lifts('other')('Sled Push', ['quads', 'glutes'], ['calves', 'abs', 'front_delts'], [
    'Load the sled, lean into the posts with your arms locked and drive with your legs.',
    'Take powerful steps for the length of the turf. Log the weight on the sled and count each length as a rep.',
  ]),
  lifts('other')('Sled Pull (Backward Drag)', ['quads'], ['calves', 'glutes'], [
    'Hold the straps and walk backward with your chest up.',
    'Take short, strong steps. Log the weight on the sled and count each length as a rep.',
  ]),
  lifts('other')('Sled Rope Pull', ['lats', 'upper_back'], ['biceps', 'forearms', 'quads'], [
    'Sit or squat facing the sled and pull the rope hand over hand.',
    'Keep your chest tall. Log the weight on the sled and count each pull to you as a rep.',
  ]),
]

export const CONDITIONING_LIFTS: CatalogEntry[] = [
  activity('cardio', 'reps', 'other')('Slam Ball Slam', ['abs', 'lats'], ['front_delts', 'glutes', 'quads'], [
    'Lift the slam ball overhead, rising onto your toes.',
    'Slam it into the floor or slam wall with your whole body, then catch it and repeat. Log the ball weight.',
  ]),
  activity('cardio', 'reps', 'other')('Wall Ball Shot', ['quads', 'front_delts'], ['glutes', 'triceps', 'abs'], [
    'Hold the ball at your chest and squat down.',
    'Drive up and throw it to the target, then catch it and go straight into the next squat. Log the ball weight.',
  ]),
  activity('cardio', 'reps', 'other')('Medicine Ball Scoop Toss', ['glutes', 'hamstrings'], ['abs', 'front_delts'], [
    'Squat low with the ball between your knees.',
    'Explode up and throw it forward and up, then retrieve it. Log the ball weight.',
  ]),
  activity('cardio', 'reps', 'other')('Medicine Ball Rotational Throw', ['obliques'], ['abs', 'front_delts', 'glutes'], [
    'Stand side-on to a wall and hold the ball at your hip.',
    'Rotate and throw it into the wall, catch it, and repeat. Log each side as its own set.',
  ]),
  activity('cardio', 'reps', 'other')('Double Unders', ['calves'], ['forearms', 'front_delts'], [
    'Turn the rope fast enough that it passes under your feet twice per jump.',
    'Stay tall and jump only as high as you need. Count each successful double as a rep.',
  ]),
  lifts('barbell')('Barbell Complex', ['glutes', 'quads', 'upper_back'], ['hamstrings', 'front_delts', 'lower_back'], [
    'Chain a few lifts with one bar without putting it down, for example row, clean, front squat, press.',
    'Keep the weight light and the form clean. Log the bar weight and count each full round as a rep.',
  ]),
  lifts('dumbbell')('Dumbbell Complex', ['glutes', 'quads', 'upper_back'], ['hamstrings', 'front_delts', 'lower_back'], [
    'Chain a few lifts with the same dumbbells without putting them down, for example row, RDL, squat, press.',
    'Keep the weight light and the form clean. Log the dumbbell weight and count each full round as a rep.',
  ]),
]
