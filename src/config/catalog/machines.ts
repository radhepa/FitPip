// Machines. The CoRec has plate-loaded stations (East Fitness) and pin-loaded selectorized ones
// (Colby Fitness, the Pavilion), so both are here, plus Smith machine lifts and the one-side-at-a-time
// versions of the same machines.
import { eachSide, lifts, type CatalogEntry } from './entry.ts'

const machine = lifts('machine')
const smith = lifts('smith_machine')
const oneSide = eachSide(machine, 'arm')
const oneLeg = eachSide(machine, 'leg')

/** Plate-loaded machines count the plates the same way every time, so progress compares. */
const plate: typeof machine = (name, primary, secondary, instructions) =>
  machine(name, primary, secondary, [...instructions, 'Count the plates the same way every time (total, both sides) so your history compares.'])

export const PLATE_LOADED: CatalogEntry[] = [
  plate('Plate-Loaded Chest Press', ['chest'], ['front_delts', 'triceps'], [
    'Set the seat so the handles line up with mid-chest.',
    'Press out until your arms are nearly straight, then return slowly.',
  ]),
  plate('Plate-Loaded Incline Chest Press', ['chest', 'front_delts'], ['triceps'], [
    'Set the seat so the handles start at upper-chest height.',
    'Press up and slightly in, then lower until your chest stretches.',
  ]),
  plate('Plate-Loaded Decline Chest Press', ['chest'], ['triceps', 'front_delts'], [
    'Sit back against the pad with the handles at lower-chest height.',
    'Press down and forward, then return slowly.',
  ]),
  plate('Plate-Loaded Shoulder Press', ['front_delts', 'side_delts'], ['triceps'], [
    'Set the seat so the handles start level with your shoulders.',
    'Press overhead without arching your back, then lower slowly.',
  ]),
  plate('Plate-Loaded Chest-Supported Row', ['upper_back', 'lats'], ['biceps', 'rear_delts'], [
    'Set the chest pad so you can reach the handles with straight arms.',
    'Row your elbows back and squeeze your shoulder blades, then reach forward under control.',
  ]),
  plate('Plate-Loaded High Row', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Sit with your chest against the pad and grab the high handles.',
    'Pull your elbows down and back, then let your arms extend fully.',
  ]),
  plate('Plate-Loaded Low Row', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Sit tall with your chest on the pad and grab the low handles.',
    'Row to your lower ribs, squeeze, then reach forward under control.',
  ]),
  plate('Plate-Loaded Lat Pulldown', ['lats'], ['biceps', 'upper_back'], [
    'Sit with your thighs locked in and grab the handles overhead.',
    'Pull your elbows down to your sides, then let your arms rise until your lats stretch.',
  ]),
  plate('Plate-Loaded Pullover', ['lats'], ['chest', 'triceps'], [
    'Set the seat so your elbows sit on the pads with your shoulders under the pivot.',
    'Sweep your elbows down toward your hips, then return to a full stretch.',
  ]),
  plate('Plate-Loaded Leg Press (Horizontal)', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Sit back against the pad and place your feet shoulder-width on the plate.',
    'Press until your legs are almost straight, then lower until your knees reach about 90 degrees.',
  ]),
  plate('Plate-Loaded Hip Thrust', ['glutes'], ['hamstrings', 'quads'], [
    'Sit with your upper back against the pad and the belt or bar over your hips.',
    'Drive your hips up until your body is level, squeeze, then lower slowly.',
  ]),
  plate('Plate-Loaded Standing Calf Raise', ['calves'], [], [
    'Put your shoulders under the pads and the balls of your feet on the platform.',
    'Rise as high as you can, pause, then lower until your calves stretch.',
  ]),
  plate('Plate-Loaded Seated Calf Raise', ['calves'], [], [
    'Sit with the pad on your lower thighs and the balls of your feet on the platform.',
    'Press up, pause, then lower to a full stretch.',
  ]),
  plate('Plate-Loaded Lying Leg Curl', ['hamstrings'], ['calves'], [
    'Lie face down with the pad just above your heels.',
    'Curl your heels toward your glutes, then lower slowly.',
  ]),
  plate('Plate-Loaded Leg Extension', ['quads'], [], [
    'Sit with the pad on your lower shins and the knee joint lined up with the pivot.',
    'Extend until your legs are straight, squeeze, then lower slowly.',
  ]),
  plate('Plate-Loaded Biceps Curl', ['biceps'], ['forearms'], [
    'Rest your upper arms on the pad and grab the handles.',
    'Curl up without lifting your elbows, then lower slowly.',
  ]),
  plate('Plate-Loaded Triceps Extension', ['triceps'], [], [
    'Rest your upper arms on the pad and grab the handles.',
    'Press down until your arms are straight, then return slowly.',
  ]),
  plate('Plate-Loaded Dip', ['triceps', 'chest'], ['front_delts'], [
    'Sit upright and grab the handles with your elbows close to your sides.',
    'Press down until your arms are straight, then let the handles rise under control.',
  ]),
  plate('Plate-Loaded Shrug', ['traps'], ['forearms'], [
    'Stand or sit tall and grab the handles at your sides.',
    'Shrug straight up, pause, then lower slowly.',
  ]),
  plate('Plate-Loaded Ab Crunch', ['abs'], ['obliques'], [
    'Sit with the pads against your chest or shoulders.',
    'Curl your ribs toward your hips, then return slowly.',
  ]),
  plate('Plate-Loaded Glute Kickback', ['glutes'], ['hamstrings'], [
    'Lean on the chest pad and place one foot on the platform.',
    'Press back and up until your hip is fully extended, then return slowly. Log each leg as its own set.',
  ]),
]

export const PIN_LOADED: CatalogEntry[] = [
  machine('Machine Incline Chest Press', ['chest', 'front_delts'], ['triceps'], [
    'Set the seat so the handles start at upper-chest height.',
    'Press up and slightly in, then lower until your chest stretches.',
  ]),
  machine('Machine Lat Pulldown (Wide Grip)', ['lats'], ['biceps', 'upper_back'], [
    'Lock your thighs under the pads and grab the bar wider than your shoulders.',
    'Pull to your upper chest, then let the bar rise until your lats stretch.',
  ]),
  machine('Machine High Row', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Sit with your chest against the pad and grab the high handles.',
    'Pull your elbows down and back, then extend fully.',
  ]),
  machine('Machine Row (Neutral Grip)', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Set the chest pad so you can reach the neutral handles with straight arms.',
    'Row to your ribs, squeeze your shoulder blades, then reach forward slowly.',
  ]),
  machine('Machine Pullover', ['lats'], ['chest', 'triceps'], [
    'Adjust the seat so your shoulders line up with the pivot.',
    'Sweep your elbows down toward your hips, then return to a full stretch.',
  ]),
  machine('Assisted Pull-Up (Machine)', ['lats'], ['biceps', 'upper_back'], [
    'Kneel on the pad and choose an assist weight that lets you finish every rep.',
    'Pull your chest toward the bar, then lower fully. Aim to use less assist over time.',
  ]),
  machine('Assisted Chin-Up (Machine)', ['lats', 'biceps'], ['upper_back'], [
    'Kneel on the pad and grab the bars with an underhand grip.',
    'Pull your chin over the bar, then lower fully. Aim to use less assist over time.',
  ]),
  machine('Assisted Dip (Machine)', ['triceps', 'chest'], ['front_delts'], [
    'Kneel on the pad and choose an assist weight that lets you finish every rep.',
    'Lower until your elbows reach about 90 degrees, then press up. Aim to use less assist over time.',
  ]),
  machine('Machine Lateral Raise', ['side_delts'], ['traps'], [
    'Sit with your elbows against the pads.',
    'Raise your arms out to shoulder height, then lower slowly.',
  ]),
  machine('Machine Biceps Curl', ['biceps'], ['forearms'], [
    'Rest your upper arms on the pad and grab the handles.',
    'Curl up without lifting your elbows, then lower slowly.',
  ]),
  machine('Machine Triceps Extension', ['triceps'], [], [
    'Rest your upper arms on the pad and grab the handles.',
    'Press down until your arms are straight, then return slowly.',
  ]),
  machine('Machine Triceps Dip', ['triceps'], ['chest', 'front_delts'], [
    'Sit upright and grab the handles with your elbows close to your sides.',
    'Press down until your arms are straight, then let the handles rise under control.',
  ]),
  machine('Machine Ab Crunch', ['abs'], ['obliques'], [
    'Sit with the pads against your chest and grab the handles.',
    'Curl your ribs toward your hips, then return slowly.',
  ]),
  machine('Machine Torso Rotation', ['obliques'], ['abs'], [
    'Sit with your thighs and hips locked in place.',
    'Rotate your torso through a comfortable range, pause, then return slowly. Log each direction as its own set.',
  ]),
  machine('Machine Glute Kickback', ['glutes'], ['hamstrings'], [
    'Lean on the chest pad and place one foot on the plate.',
    'Press back until your hip is fully extended, then return slowly. Log each leg as its own set.',
  ]),
  machine('Machine Standing Calf Raise', ['calves'], [], [
    'Put your shoulders under the pads and the balls of your feet on the platform.',
    'Rise as high as you can, pause, then lower to a full stretch.',
  ]),
  machine('Machine Seated Leg Press', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Adjust the seat so your knees start at about 90 degrees.',
    'Press until your legs are almost straight, then lower under control.',
  ]),
]

export const ONE_SIDE_MACHINES: CatalogEntry[] = [
  oneSide('Single-Arm Machine Chest Press', ['chest'], ['front_delts', 'triceps'], [
    'Use the machine\'s independent handles and press one side at a time.',
    'Keep your torso square, then return until your chest stretches.',
  ]),
  oneSide('Single-Arm Machine Row', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Use the independent handles and row one side at a time.',
    'Keep your chest on the pad, squeeze your shoulder blade, then reach forward slowly.',
  ]),
  oneSide('Single-Arm Machine Shoulder Press', ['front_delts', 'side_delts'], ['triceps'], [
    'Use the independent handles and press one side at a time.',
    'Keep your ribs down, then lower to shoulder height.',
  ]),
  oneSide('Single-Arm Machine Lat Pulldown', ['lats'], ['biceps', 'upper_back'], [
    'Use the independent handles and pull one side at a time.',
    'Drive your elbow down to your side, then let your arm rise until your lat stretches.',
  ]),
  oneSide('Single-Arm Machine Pec Fly', ['chest'], ['front_delts'], [
    'Grab one handle and keep your back against the pad.',
    'Sweep your arm across with a soft elbow, then open slowly.',
  ]),
  oneSide('Single-Arm Machine Reverse Fly', ['rear_delts'], ['upper_back'], [
    'Face the pad and grab one handle.',
    'Sweep your arm back with a soft elbow, then return slowly.',
  ]),
  oneLeg('Single-Leg Leg Press', ['quads', 'glutes'], ['hamstrings'], [
    'Place one foot in the middle of the platform and keep your hips flat on the seat.',
    'Press until your leg is almost straight, then lower under control.',
  ]),
  oneLeg('Single-Leg Leg Extension', ['quads'], [], [
    'Sit with the pad on one shin and the other foot behind the second pad.',
    'Extend until your leg is straight, squeeze, then lower slowly.',
  ]),
  oneLeg('Single-Leg Leg Curl', ['hamstrings'], ['calves'], [
    'Set up on the machine with one heel under the pad.',
    'Curl toward your glutes, then lower slowly.',
  ]),
]

export const SMITH_MACHINE: CatalogEntry[] = [
  smith('Smith Machine Bench Press', ['chest'], ['front_delts', 'triceps'], [
    'Set the bench so the bar lowers to mid-chest.',
    'Unhook, lower with control, then press until your arms are straight and rehook.',
  ]),
  smith('Smith Machine Incline Press', ['chest', 'front_delts'], ['triceps'], [
    'Set the bench to about 30 degrees so the bar lowers to your upper chest.',
    'Lower with control, press up, and rehook when you are done.',
  ]),
  smith('Smith Machine Shoulder Press', ['front_delts', 'side_delts'], ['triceps'], [
    'Sit with the bar starting at your chin.',
    'Press overhead without arching your back, then lower slowly.',
  ]),
  smith('Smith Machine Squat', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Put the bar across your upper back with your feet slightly in front of it.',
    'Sit down until your thighs are at least parallel, then drive back up.',
  ]),
  smith('Smith Machine Split Squat', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Put the bar across your upper back and step one foot forward.',
    'Lower your back knee toward the floor, then drive up through your front heel.',
  ]),
  smith('Smith Machine Reverse Lunge', ['quads', 'glutes'], ['hamstrings'], [
    'Put the bar across your upper back and stand slightly forward of it.',
    'Step back into a lunge, then push through your front foot to return.',
  ]),
  smith('Smith Machine Romanian Deadlift', ['hamstrings', 'glutes'], ['lower_back'], [
    'Hold the bar at your thighs with a soft knee bend.',
    'Push your hips back and slide the bar down your legs, then squeeze your glutes to stand.',
  ]),
  smith('Smith Machine Hip Thrust', ['glutes'], ['hamstrings', 'quads'], [
    'Sit with your upper back on a bench and the bar padded over your hips.',
    'Drive up until your body is level, squeeze, then lower slowly.',
  ]),
  smith('Smith Machine Bent-Over Row', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'lower_back'], [
    'Hinge forward with a flat back and hold the bar with an overhand grip.',
    'Row to your lower ribs, squeeze, then lower under control.',
  ]),
  smith('Smith Machine Calf Raise', ['calves'], [], [
    'Stand on a plate or step under the bar with the balls of your feet on the edge.',
    'Rise as high as you can, pause, then lower to a full stretch.',
  ]),
  smith('Smith Machine Shrug', ['traps'], ['forearms'], [
    'Hold the bar at your thighs with straight arms.',
    'Shrug straight up, pause, then lower slowly.',
  ]),
]
