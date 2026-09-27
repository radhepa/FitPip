// Dumbbells and kettlebells: the free-weight staples, plus the single-arm and single-leg versions
// of lifts that are usually done with two hands, so each side has to carry its own load.
import { eachSide, lifts, type CatalogEntry } from './entry.ts'

const db = lifts('dumbbell')
const kb = lifts('kettlebell')
const oneArm = eachSide(db, 'arm')
const oneLeg = eachSide(db, 'leg')
const kbArm = eachSide(kb, 'arm')

export const DUMBBELL_UPPER: CatalogEntry[] = [
  // Chest
  db('Dumbbell Floor Press', ['chest', 'triceps'], ['front_delts'], [
    'Lie on the floor with your knees bent and lower until your triceps touch down.',
    'Pause briefly, then press up.',
  ]),
  db('Dumbbell Decline Bench Press', ['chest'], ['triceps', 'front_delts'], [
    'Lie on a decline bench with a dumbbell in each hand at your lower chest.',
    'Press up and slightly in, then lower slowly.',
  ]),
  db('Dumbbell Squeeze Press', ['chest'], ['triceps', 'front_delts'], [
    'Press the dumbbells together in the middle and keep squeezing them.',
    'Press up from your chest while keeping that pressure, then lower slowly.',
  ]),
  db('Dumbbell Incline Fly', ['chest', 'front_delts'], [], [
    'Lie on a 30 degree bench with your arms above your chest and a soft elbow bend.',
    'Open your arms wide until you feel your chest stretch, then bring them together.',
  ]),
  db('Dumbbell Pullover', ['lats', 'chest'], ['triceps'], [
    'Lie across a bench holding one dumbbell over your chest with both hands.',
    'Lower it behind your head with soft elbows until your lats stretch, then pull it back.',
  ]),
  oneArm('Single-Arm Dumbbell Bench Press', ['chest'], ['front_delts', 'triceps', 'obliques'], [
    'Lie on a bench with one dumbbell at your chest and brace your core so you do not roll.',
    'Press straight up, then lower slowly.',
  ]),
  oneArm('Single-Arm Dumbbell Incline Press', ['chest', 'front_delts'], ['triceps', 'obliques'], [
    'Sit on an incline bench with one dumbbell at your shoulder.',
    'Press up without twisting, then lower slowly.',
  ]),
  oneArm('Single-Arm Dumbbell Floor Press', ['chest', 'triceps'], ['front_delts', 'obliques'], [
    'Lie on the floor with one knee bent and one dumbbell at your chest.',
    'Press up, then lower until your triceps touch down.',
  ]),
  // Back
  db('One-Arm Dumbbell Row', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Support yourself with one hand and knee on a bench and let the dumbbell hang.',
    'Row it to your hip, squeeze your shoulder blade, then lower fully. Log each arm as its own set.',
  ]),
  db('Chest-Supported Dumbbell Row', ['upper_back', 'lats'], ['biceps', 'rear_delts'], [
    'Lie face down on an incline bench with a dumbbell in each hand.',
    'Row both up toward your ribs, squeeze, then lower fully.',
  ]),
  db('Kroc Row', ['lats', 'upper_back'], ['biceps', 'forearms', 'rear_delts'], [
    'Brace with one hand on a bench and use a heavy dumbbell for high reps.',
    'Row it to your hip with a small body English, then lower fully. Log each arm as its own set.',
  ]),
  db('Renegade Row', ['upper_back', 'lats'], ['abs', 'obliques', 'biceps'], [
    'Hold a plank on two dumbbells with your feet wide.',
    'Row one dumbbell to your hip without letting your hips twist, then alternate sides.',
  ]),
  db('Dumbbell Scaption Raise', ['front_delts', 'side_delts'], ['traps'], [
    'Stand with the dumbbells in front of your thighs and your thumbs up.',
    'Raise your arms about 30 degrees in front of your sides to shoulder height, then lower slowly.',
  ]),
  // Shoulders
  db('Dumbbell Standing Overhead Press', ['front_delts', 'side_delts'], ['triceps', 'abs'], [
    'Hold the dumbbells at your shoulders and brace your core.',
    'Press straight overhead, then lower to your shoulders.',
  ]),
  db('Dumbbell Push Press', ['front_delts', 'side_delts'], ['triceps', 'quads'], [
    'Dip a few inches with your torso upright, then drive up through your legs.',
    'Finish with locked arms overhead and lower to your shoulders.',
  ]),
  oneArm('Single-Arm Dumbbell Shoulder Press', ['front_delts', 'side_delts'], ['triceps', 'obliques'], [
    'Hold one dumbbell at your shoulder, stand tall and brace your core.',
    'Press overhead without leaning, then lower to your shoulder.',
  ]),
  oneArm('Single-Arm Dumbbell Push Press', ['front_delts', 'side_delts'], ['triceps', 'quads', 'obliques'], [
    'Hold one dumbbell at your shoulder and dip a few inches.',
    'Drive up through your legs and press overhead, then lower to your shoulder.',
  ]),
  db('Dumbbell Lean-Away Lateral Raise', ['side_delts'], ['traps'], [
    'Hold a pole or rack with one hand and lean away with a dumbbell in the other.',
    'Raise the dumbbell out to shoulder height, then lower slowly. Log each arm as its own set.',
  ]),
  db('Dumbbell Y Raise', ['side_delts', 'rear_delts'], ['traps'], [
    'Lie chest-down on an incline bench with a light dumbbell in each hand.',
    'Raise your arms up and out in a Y with thumbs up, then lower slowly.',
  ]),
  db('Dumbbell Incline Rear Delt Fly', ['rear_delts'], ['upper_back'], [
    'Lie chest-down on an incline bench with a light dumbbell in each hand.',
    'Raise your arms out wide with a soft elbow bend, squeeze, then lower slowly.',
  ]),
  db('Dumbbell Upright Row', ['side_delts', 'traps'], ['biceps'], [
    'Hold the dumbbells in front of your thighs.',
    'Lead with your elbows up to about chest height, then lower slowly.',
  ]),
  // Arms
  db('Dumbbell Concentration Curl', ['biceps'], ['forearms'], [
    'Sit and rest your upper arm against your inner thigh with a dumbbell hanging.',
    'Curl up and squeeze, then lower slowly. Log each arm as its own set.',
  ]),
  db('Dumbbell Zottman Curl', ['biceps', 'forearms'], [], [
    'Curl the dumbbells up with your palms facing up.',
    'Turn your hands over at the top and lower with your palms facing down.',
  ]),
  db('Dumbbell Cross-Body Hammer Curl', ['biceps', 'forearms'], [], [
    'Hold the dumbbells with a neutral grip at your sides.',
    'Curl one across your body toward the opposite shoulder, lower, then alternate.',
  ]),
  db('Dumbbell Spider Curl', ['biceps'], ['forearms'], [
    'Lie chest-down on an incline bench with your arms hanging straight.',
    'Curl up without letting your elbows move, then lower fully.',
  ]),
  db('Dumbbell Reverse Curl', ['forearms', 'biceps'], [], [
    'Hold the dumbbells with your palms down.',
    'Curl up with your wrists straight, then lower slowly.',
  ]),
  db('Dumbbell Overhead Triceps Extension', ['triceps'], [], [
    'Hold one dumbbell overhead with both hands and your elbows pointing up.',
    'Lower it behind your head, then extend back up.',
  ]),
  oneArm('Single-Arm Dumbbell Overhead Triceps Extension', ['triceps'], [], [
    'Hold one dumbbell overhead with your elbow pointing up.',
    'Lower it behind your head, then extend back up.',
  ]),
  db('Dumbbell Lying Triceps Extension', ['triceps'], [], [
    'Lie on a bench with the dumbbells above your chest and your elbows in.',
    'Bend your elbows to lower them beside your head, then extend.',
  ]),
  db('Dumbbell Triceps Kickback', ['triceps'], ['rear_delts'], [
    'Hinge forward with your upper arm parallel to the floor.',
    'Extend your forearm back until straight, then bend slowly.',
  ]),
  db('Dumbbell Wrist Curl', ['forearms'], [], [
    'Rest your forearms on your thighs with your palms up.',
    'Curl your wrists up, then lower fully.',
  ]),
  db('Dumbbell Reverse Wrist Curl', ['forearms'], [], [
    'Rest your forearms on your thighs with your palms down.',
    'Lift the back of your hands up, then lower fully.',
  ]),
]

export const DUMBBELL_LOWER_AND_POWER: CatalogEntry[] = [
  db('Dumbbell Romanian Deadlift', ['hamstrings', 'glutes'], ['lower_back'], [
    'Hold the dumbbells at your thighs with a soft knee bend.',
    'Push your hips back and lower along your legs, then squeeze your glutes to stand.',
  ]),
  oneLeg('Single-Leg Dumbbell Romanian Deadlift', ['hamstrings', 'glutes'], ['lower_back', 'abs'], [
    'Stand on one leg holding a dumbbell and keep a soft knee bend.',
    'Hinge forward while the other leg lifts behind you, then squeeze your glute to stand.',
  ]),
  db('Dumbbell Deadlift', ['glutes', 'hamstrings'], ['quads', 'lower_back', 'traps'], [
    'Stand with the dumbbells at your sides and hinge down with a flat back.',
    'Push the floor away to stand, then lower under control.',
  ]),
  db('Dumbbell Reverse Lunge', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Hold the dumbbells at your sides and step one foot back.',
    'Lower your back knee toward the floor, then push through your front foot to stand.',
  ]),
  db('Dumbbell Walking Lunge', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Hold the dumbbells at your sides and take a long step forward.',
    'Lower your back knee toward the floor, then drive into the next step.',
  ]),
  db('Dumbbell Lateral Lunge', ['quads', 'glutes', 'adductors'], ['hamstrings'], [
    'Hold one dumbbell at your chest and step wide to one side.',
    'Sit back into that hip with the other leg straight, then push back to the middle.',
  ]),
  db('Dumbbell Curtsy Lunge', ['glutes', 'quads'], ['adductors', 'abductors'], [
    'Hold the dumbbells at your sides and step one foot behind and across the other.',
    'Lower your back knee toward the floor, then push back up.',
  ]),
  db('Dumbbell Bulgarian Split Squat', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Rest your back foot on a bench and hold a dumbbell in each hand.',
    'Lower straight down until your front thigh is about parallel, then drive up. Log each leg as its own set.',
  ]),
  db('Dumbbell Front Squat', ['quads', 'glutes'], ['abs', 'upper_back'], [
    'Hold the dumbbells on your front shoulders with your elbows up.',
    'Squat down keeping your chest tall, then drive up.',
  ]),
  db('Dumbbell Sumo Squat', ['glutes', 'adductors', 'quads'], ['hamstrings'], [
    'Stand wide with your toes out and hold one dumbbell between your legs.',
    'Sit straight down with your knees over your toes, then stand.',
  ]),
  db('Dumbbell Hip Thrust', ['glutes'], ['hamstrings', 'quads'], [
    'Sit with your upper back on a bench and rest a dumbbell across your hips.',
    'Drive up until your body is level, squeeze, then lower slowly.',
  ]),
  db('Dumbbell Calf Raise', ['calves'], [], [
    'Hold the dumbbells at your sides and stand on the edge of a step.',
    'Rise as high as you can, pause, then lower to a full stretch.',
  ]),
  oneLeg('Single-Leg Dumbbell Calf Raise', ['calves'], [], [
    'Hold a dumbbell in one hand and stand on the edge of a step on one foot.',
    'Rise as high as you can, pause, then lower to a full stretch.',
  ]),
  db('Dumbbell Thruster', ['quads', 'front_delts'], ['glutes', 'triceps', 'abs'], [
    'Hold the dumbbells on your shoulders and squat down.',
    'Drive up and press the dumbbells overhead in one motion.',
  ]),
  oneArm('Single-Arm Dumbbell Thruster', ['quads', 'front_delts'], ['glutes', 'triceps', 'obliques'], [
    'Hold one dumbbell at your shoulder and squat down.',
    'Drive up and press it overhead in one motion.',
  ]),
  oneArm('Single-Arm Dumbbell Snatch', ['glutes', 'hamstrings', 'front_delts'], ['traps', 'quads', 'abs'], [
    'Start with the dumbbell between your feet and hinge back.',
    'Drive your hips forward and pull the dumbbell overhead in one motion.',
  ]),
  oneArm('Single-Arm Dumbbell Clean and Press', ['glutes', 'front_delts'], ['traps', 'quads', 'triceps'], [
    'Start with the dumbbell between your feet and hinge back.',
    'Extend your hips, catch it at your shoulder, then press it overhead.',
  ]),
  db('Dumbbell Side Bend', ['obliques'], [], [
    'Hold a dumbbell in one hand and stand tall.',
    'Bend sideways toward the weight, then pull back up with your side abs. Log each side as its own set.',
  ]),
  db('Dumbbell Woodchop', ['obliques'], ['abs', 'front_delts'], [
    'Hold one dumbbell with both hands above one shoulder.',
    'Chop diagonally down across your body, pivoting your feet, then return. Log each side as its own set.',
  ]),
]

export const KETTLEBELL: CatalogEntry[] = [
  kb('Kettlebell Goblet Squat', ['quads', 'glutes'], ['abs', 'upper_back'], [
    'Hold the kettlebell by the horns at your chest.',
    'Squat between your knees keeping your chest tall, then stand.',
  ]),
  kb('Kettlebell Front Squat', ['quads', 'glutes'], ['abs', 'upper_back'], [
    'Rack one or two kettlebells at your shoulders.',
    'Squat down keeping your elbows tucked, then stand.',
  ]),
  kb('Kettlebell Romanian Deadlift', ['hamstrings', 'glutes'], ['lower_back'], [
    'Hold the kettlebell in front of your thighs with a soft knee bend.',
    'Hinge back until your hamstrings stretch, then squeeze your glutes to stand.',
  ]),
  kbArm('Single-Arm Kettlebell Swing', ['glutes', 'hamstrings'], ['lower_back', 'front_delts', 'abs'], [
    'Hike the kettlebell back between your legs and hinge at the hips.',
    'Snap your hips forward to float the bell to chest height, then hinge back.',
  ]),
  kbArm('Single-Arm Kettlebell Clean', ['glutes', 'hamstrings'], ['traps', 'biceps', 'abs'], [
    'Hike the kettlebell back, then snap your hips forward.',
    'Guide the bell into the rack position at your shoulder without letting it slam.',
  ]),
  kbArm('Single-Arm Kettlebell Press', ['front_delts', 'side_delts'], ['triceps', 'abs'], [
    'Rack the kettlebell at your shoulder with your wrist straight.',
    'Press overhead until your arm is locked, then lower to the rack.',
  ]),
  kbArm('Single-Arm Kettlebell Snatch', ['glutes', 'hamstrings', 'front_delts'], ['traps', 'quads', 'abs'], [
    'Hike the kettlebell back and hinge at the hips.',
    'Snap forward and punch your hand through to lock the bell overhead in one motion.',
  ]),
  kbArm('Kettlebell Turkish Get-Up', ['abs', 'front_delts'], ['glutes', 'obliques', 'quads'], [
    'Lie on your back with the kettlebell locked out above your shoulder.',
    'Rise to standing in stages, keeping your eyes on the bell, then reverse the steps.',
  ]),
  kb('Kettlebell Halo', ['front_delts', 'side_delts'], ['upper_back', 'triceps'], [
    'Hold the kettlebell upside down by the horns at your chest.',
    'Circle it around your head, keeping your ribs down, and switch directions each set.',
  ]),
  kbArm('Kettlebell Windmill', ['obliques', 'glutes'], ['hamstrings', 'front_delts'], [
    'Lock the kettlebell overhead and turn your feet slightly out.',
    'Push your hips back and slide your other hand down your leg, watching the bell, then stand.',
  ]),
]
