// The cable stack, one arm at a time: lifts that are normally two-handed, done single-arm so each
// side works on its own and the core has to stop you twisting. Plus the rest of the cable moves
// (anti-rotation, ankle-strap leg work, and two-handed staples) the Colby, Pavilion, Loft and
// Scifres cable stations get used for.
import { eachSide, holds, lifts, type CatalogEntry } from './entry.ts'

const cable = lifts('cable')
const arm = eachSide(cable, 'arm')
const leg = eachSide(cable, 'leg')
const side = eachSide(cable, 'side')

export const SINGLE_ARM_CABLE: CatalogEntry[] = [
  // Chest
  arm('Single-Arm Cable Chest Press', ['chest'], ['front_delts', 'triceps'], [
    'Set the pulley at chest height, face away from the stack and stand in a split stance.',
    'Press the handle straight out without letting your torso rotate, then return under control.',
  ]),
  arm('Single-Arm Cable Fly', ['chest'], ['front_delts'], [
    'Set the pulley at shoulder height and step forward in a split stance.',
    'Sweep your arm across your body with a soft elbow, pause, then open slowly.',
  ]),
  arm('Single-Arm High-to-Low Cable Fly', ['chest'], ['front_delts'], [
    'Set the pulley high and step forward with the handle in one hand.',
    'Sweep down and across toward the opposite hip with a soft elbow, then return slowly.',
  ]),
  arm('Single-Arm Low-to-High Cable Fly', ['chest', 'front_delts'], [], [
    'Set the pulley low and step forward with the handle in one hand.',
    'Sweep up and across to eye level with a soft elbow, then lower with control.',
  ]),
  arm('Single-Arm Incline Cable Press', ['chest', 'front_delts'], ['triceps'], [
    'Set a bench to about 30 degrees with a low pulley behind it and hold the handle at your shoulder.',
    'Press up and slightly in, then lower until your chest stretches.',
  ]),
  // Back
  arm('Single-Arm Cable Row', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Set the pulley at waist height, face the stack and hold one handle.',
    'Row your elbow past your ribs and squeeze your shoulder blade back, then reach forward without twisting.',
  ]),
  arm('Single-Arm Cable Lat Pulldown', ['lats'], ['biceps', 'upper_back'], [
    'Set the pulley high, sit or kneel facing the stack and hold one handle overhead.',
    'Pull your elbow down to your side with your chest tall, then let your arm rise until your lat stretches.',
  ]),
  arm('Single-Arm Half-Kneeling Cable Pulldown', ['lats'], ['obliques', 'biceps'], [
    'Kneel on the knee opposite the working arm, facing a high pulley.',
    'Pull the handle to your ribs while you brace so your torso stays square, then return to a full stretch.',
  ]),
  arm('Single-Arm Cable Straight-Arm Pulldown', ['lats'], ['triceps'], [
    'Set the pulley high, hinge slightly and hold the handle with a straight arm.',
    'Sweep down to your thigh with your lat, then return slowly to a full stretch.',
  ]),
  arm('Single-Arm Cable High Row', ['upper_back', 'rear_delts'], ['lats', 'biceps'], [
    'Set the pulley at head height and face the stack.',
    'Pull the handle toward your ear with a high, wide elbow and squeeze, then return slowly.',
  ]),
  arm('Single-Arm Cable Face Pull', ['rear_delts'], ['upper_back', 'traps'], [
    'Set the pulley at face height and hold one handle.',
    'Pull toward your eye while your fist rotates outward and your elbow goes back, then extend slowly.',
  ]),
  arm('Single-Arm Cable Rear Delt Fly', ['rear_delts'], ['upper_back'], [
    'Set the pulley at shoulder height and hold the handle across your body with the far hand.',
    'Sweep your arm out and back with a soft elbow and squeeze, then return slowly.',
  ]),
  arm('Single-Arm Cable Shrug', ['traps'], ['forearms'], [
    'Set the pulley at the bottom and stand tall with the handle at your side.',
    'Lift your shoulder straight up toward your ear without rolling, then lower slowly.',
  ]),
  arm('Single-Arm Cable Upright Row', ['side_delts', 'traps'], ['biceps'], [
    'Set the pulley low and hold the handle in front of your thigh.',
    'Lead with your elbow up to about chest height, then lower slowly. Stop if your shoulder pinches.',
  ]),
  // Shoulders
  arm('Single-Arm Cable Shoulder Press', ['front_delts', 'side_delts'], ['triceps'], [
    'Set the pulley low, stand or half-kneel side-on and hold the handle at your shoulder.',
    'Press overhead in a straight line without leaning away, then lower to your shoulder.',
  ]),
  arm('Single-Arm Cable Front Raise', ['front_delts'], ['chest'], [
    'Set the pulley low and stand facing away from it with the handle in one hand.',
    'Raise your straight arm to shoulder height without swinging, then lower slowly.',
  ]),
  arm('Single-Arm Cable Lateral Raise (Cross-Body)', ['side_delts'], ['traps'], [
    'Set the pulley low and stand side-on, holding the handle across your body with the far hand.',
    'Raise your arm out to shoulder height, leading with the elbow, then lower slowly with your torso still.',
  ]),
  arm('Single-Arm Cable Lateral Raise (Behind the Back)', ['side_delts'], [], [
    'Set the pulley low and stand with your back to it, holding the handle behind you.',
    'Raise your arm out to the side to shoulder height, then lower slowly.',
  ]),
  arm('Single-Arm Cable Y-Raise', ['side_delts', 'rear_delts'], ['traps'], [
    'Set the pulley low and hold the handle across your body.',
    'Raise your arm up and out in a Y, thumb up, to just above shoulder height, then lower slowly.',
  ]),
  arm('Single-Arm Cable External Rotation', ['rear_delts'], ['upper_back'], [
    'Set the pulley at elbow height and hold the handle across your body with your elbow tucked at your side.',
    'Rotate your forearm out, keeping the elbow pinned, then return slowly. Use a light weight.',
  ]),
  // Arms
  arm('Single-Arm Cable Curl', ['biceps'], ['forearms'], [
    'Set the pulley low and hold the handle at your side, palm forward.',
    'Curl up without swinging your elbow forward, squeeze, then lower slowly.',
  ]),
  arm('Single-Arm Cable Hammer Curl', ['biceps', 'forearms'], [], [
    'Set the pulley low and hold the handle with a neutral grip.',
    'Curl toward your shoulder with your elbow by your ribs, then lower with control.',
  ]),
  arm('Single-Arm High Cable Curl', ['biceps'], [], [
    'Set the pulley at head height and stand side-on with your arm out at shoulder level.',
    'Curl the handle toward your head keeping the elbow high, then extend slowly.',
  ]),
  arm('Single-Arm Cable Bayesian Curl', ['biceps'], ['forearms'], [
    'Set the pulley low, face away from it and hold the handle with your arm behind your body.',
    'Curl forward while your elbow stays back so the biceps stays stretched, then lower to a full stretch.',
  ]),
  arm('Single-Arm Cable Preacher Curl', ['biceps'], [], [
    'Set a preacher pad or incline bench in front of a low pulley.',
    'Rest your upper arm on the pad, curl up, and lower slowly without letting your shoulder roll forward.',
  ]),
  arm('Single-Arm Cable Reverse Curl', ['forearms', 'biceps'], [], [
    'Set the pulley low and hold the handle with your palm facing down.',
    'Curl up with your wrist straight, then lower slowly.',
  ]),
  arm('Single-Arm Cable Triceps Pushdown', ['triceps'], [], [
    'Set the pulley high and hold the handle with your elbow tucked at your side.',
    'Press down until your arm is straight, then let it rise until your forearm is just past parallel.',
  ]),
  arm('Single-Arm Reverse-Grip Cable Pushdown', ['triceps'], ['forearms'], [
    'Set the pulley high and hold the handle with your palm facing up.',
    'Press down until your arm is straight with your elbow pinned, then return slowly.',
  ]),
  arm('Single-Arm Overhead Cable Triceps Extension', ['triceps'], [], [
    'Set the pulley low, face away from it and hold the handle behind your head with your elbow pointing up.',
    'Extend your arm overhead without flaring the elbow, then lower until your triceps stretches.',
  ]),
  arm('Single-Arm Cable Triceps Kickback', ['triceps'], ['rear_delts'], [
    'Set the pulley low, hinge forward and hold the handle with your upper arm parallel to the floor.',
    'Extend your forearm back until straight, squeeze, then bend slowly.',
  ]),
  arm('Single-Arm Cable Wrist Curl', ['forearms'], [], [
    'Rest your forearm on a bench or your thigh, palm up, holding a low-pulley handle.',
    'Curl your wrist up, then lower slowly. Use a light weight and the full range.',
  ]),
]

export const CABLE_CORE_AND_LEGS: CatalogEntry[] = [
  // Anti-rotation and core
  side('Pallof Press', ['obliques', 'abs'], ['front_delts'], [
    'Set a cable at chest height and stand side-on, holding the handle at your chest with both hands.',
    'Press straight out and resist the pull trying to rotate you, then bring it back.',
  ]),
  side('Half-Kneeling Pallof Press', ['obliques', 'abs'], ['glutes'], [
    'Kneel on the knee farthest from the stack with the cable at chest height.',
    'Press out and hold for a second while you stay square, then bring it back.',
  ]),
  holds('cable')('Pallof Hold', ['obliques', 'abs'], ['front_delts'], [
    'Set up like a Pallof press, press the handle out and hold it there.',
    'Stay square to the stack and breathe steadily. Log each side as its own set.',
  ]),
  side('Cable Woodchop (High to Low)', ['obliques'], ['abs', 'front_delts'], [
    'Set the pulley high and stand side-on, holding the handle with both hands.',
    'Pull diagonally down across your body, turning hips and shoulders together, then return slowly.',
  ]),
  side('Cable Woodchop (Low to High)', ['obliques'], ['abs', 'glutes'], [
    'Set the pulley low and stand side-on, holding the handle with both hands.',
    'Drive diagonally up across your body, pivoting your back foot, then lower slowly.',
  ]),
  arm('Single-Arm Cable Chop (Half-Kneeling)',['obliques'], ['abs', 'lats'], [
    'Kneel on one knee with a high pulley beside you and hold the handle with one hand.',
    'Pull down and across while you brace your core, then return slowly.',
  ]),
  side('Standing Cable Side Bend', ['obliques'], [], [
    'Hold a low-pulley handle at your side and stand tall.',
    'Bend sideways toward the stack, then pull back up with your side abs.',
  ]),
  cable('Kneeling Cable Crunch', ['abs'], ['obliques'], [
    'Kneel facing a high pulley and hold the rope beside your head.',
    'Curl your ribs toward your hips without pulling with your arms, then return slowly.',
  ]),
  // Lower body
  cable('Cable Pull-Through', ['glutes', 'hamstrings'], ['lower_back'], [
    'Face away from a low pulley and hold the rope between your legs.',
    'Hinge back with a flat spine, then drive your hips forward and squeeze your glutes.',
  ]),
  leg('Cable Glute Kickback (Ankle Strap)', ['glutes'], ['hamstrings'], [
    'Clip the ankle strap on and hold the frame for balance.',
    'Kick your leg straight back without arching your lower back, then return slowly.',
  ]),
  leg('Cable Hip Abduction (Ankle Strap)', ['abductors'], ['glutes'], [
    'Stand side-on to the stack with the strap on the ankle farthest from it.',
    'Sweep that leg out to the side with a still torso, then return slowly.',
  ]),
  leg('Cable Hip Adduction (Ankle Strap)', ['adductors'], [], [
    'Stand side-on to the stack with the strap on the ankle nearest it.',
    'Sweep that leg across in front of the other, then return slowly.',
  ]),
]

export const CABLE_TWO_HANDED: CatalogEntry[] = [
  cable('Cable Rope Face Pull', ['rear_delts'], ['upper_back', 'traps'], [
    'Set the rope at face height and step back until the cable is taut.',
    'Pull the ends toward your ears with high, wide elbows, then extend slowly.',
  ]),
  cable('Cable Rope Triceps Pushdown', ['triceps'], [], [
    'Set the rope high and tuck your elbows at your sides.',
    'Push down and split the rope apart at the bottom, then let it rise slowly.',
  ]),
  cable('Cable Straight-Bar Triceps Pushdown', ['triceps'], [], [
    'Set a straight bar on a high pulley and tuck your elbows at your sides.',
    'Push down until your arms are straight, then let the bar rise slowly.',
  ]),
  cable('Cable Reverse-Grip Triceps Pushdown', ['triceps'], ['forearms'], [
    'Hold a straight bar on a high pulley with an underhand grip.',
    'Push down with your elbows pinned, then return slowly.',
  ]),
  cable('Cable Rope Hammer Curl', ['biceps', 'forearms'], [], [
    'Set the rope on a low pulley and hold the ends with a neutral grip.',
    'Curl up with your elbows by your ribs, then lower slowly.',
  ]),
  cable('Cable EZ-Bar Curl', ['biceps'], ['forearms'], [
    'Attach an EZ-bar to a low pulley and stand tall.',
    'Curl without swinging and keep constant tension on the way down.',
  ]),
  cable('Cable Chest Press (Standing)', ['chest'], ['front_delts', 'triceps'], [
    'Set both pulleys at chest height and stand in a split stance facing away.',
    'Press both handles out and together, then return until your chest stretches.',
  ]),
  cable('Cable Crossover (High to Low)', ['chest'], ['front_delts'], [
    'Set both pulleys high, lean slightly forward and hold a handle in each hand.',
    'Sweep your hands down and together in front of your hips with soft elbows, then open slowly.',
  ]),
  cable('Cable Crossover (Low to High)', ['chest', 'front_delts'], [], [
    'Set both pulleys low and hold a handle in each hand.',
    'Sweep your hands up and together to eye level with soft elbows, then lower with control.',
  ]),
  cable('Seated Cable Row (Wide Grip)', ['upper_back', 'lats'], ['rear_delts', 'biceps'], [
    'Sit tall with your feet braced and hold a wide bar.',
    'Row to your lower ribs with your elbows flared, squeeze, then reach forward under control.',
  ]),
  cable('Seated Cable Row (Neutral Grip)', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Sit tall with your feet braced and hold a close, neutral handle.',
    'Row to your belly with your elbows tight, squeeze, then reach forward under control.',
  ]),
  cable('Cable Lat Pulldown (Wide Grip)', ['lats'], ['biceps', 'upper_back'], [
    'Sit with your thighs locked under the pads and hold the bar wider than your shoulders.',
    'Pull the bar to your upper chest with your chest tall, then let it rise until your lats stretch.',
  ]),
  cable('Cable Lat Pulldown (Neutral Grip)', ['lats'], ['biceps', 'upper_back'], [
    'Hold a close, neutral-grip handle and sit with your thighs locked under the pads.',
    'Pull your elbows down to your sides, then let the handle rise slowly.',
  ]),
  cable('Cable Lat Pulldown (Reverse Grip)', ['lats', 'biceps'], ['upper_back'], [
    'Hold the bar shoulder-width with an underhand grip.',
    'Pull to your upper chest, then let it rise until your lats stretch.',
  ]),
  cable('Cable Straight-Arm Pulldown (Rope)', ['lats'], ['triceps'], [
    'Set a rope on a high pulley, hinge slightly and hold the ends with straight arms.',
    'Sweep the rope down to your thighs with your lats, then return slowly.',
  ]),
]
