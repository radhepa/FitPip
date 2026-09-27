// Cardio that suits a cut: low-impact calorie burners (incline walking, stairs, bikes, the rower),
// intervals, track and outdoor running, conditioning circuits, swimming, boxing and sports. Machine
// names follow what the CoRec floor has: treadmills, ellipticals, bikes, a Concept2 rower, battle
// ropes, a slam wall, an atrium track, a cycling studio, climbing walls and a pool.
import { activity, type CatalogEntry } from './entry.ts'

const consoleNote = 'Log the time and distance from the console.'

const machineEffort = activity('cardio', 'distance', 'machine')
const machineRounds = activity('cardio', 'time', 'machine')
const bodyEffort = activity('cardio', 'distance', 'bodyweight')
const bodyRounds = activity('cardio', 'time', 'bodyweight')

export const TREADMILL_AND_RUNNING: CatalogEntry[] = [
  machineEffort('Incline Treadmill Walk (12-3-30)', ['glutes', 'calves'], ['hamstrings', 'quads'], [
    'Set the treadmill to a 12% incline and 3 mph, then walk for 30 minutes without holding the rails.',
    consoleNote,
  ]),
  machineRounds('Treadmill Intervals', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Alternate hard efforts with easy walking or jogging.',
    'Each logged set is one hard interval.',
  ]),
  machineRounds('Treadmill Hill Intervals', ['glutes', 'quads'], ['calves', 'hamstrings'], [
    'Raise the incline for each hard effort, then drop it to recover.',
    'Each logged set is one hard interval.',
  ]),
  machineEffort('Zone 2 Treadmill Jog', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Jog at a pace where you can still hold a conversation.',
    consoleNote,
  ]),
  bodyEffort('Indoor Track Run', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Run at an easy, steady pace and switch direction on alternate days to spare your legs.',
    'Log the time, and the distance if you know the lap length (it is posted at the track).',
  ]),
  bodyEffort('Indoor Track Walk', ['calves'], ['quads', 'glutes'], [
    'Walk at a brisk pace and swing your arms.',
    'Log the time, and the distance if you know the lap length (it is posted at the track).',
  ]),
  bodyEffort('Track Intervals (400 m)', ['quads', 'hamstrings', 'glutes'], ['calves'], [
    'Run hard for one lap, then walk or jog a lap to recover.',
    'Each logged set is one hard repeat with its time and distance.',
  ]),
  bodyEffort('Easy Run (Zone 2)', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Run at a pace where you can talk in full sentences.',
    'Keep it steady. This is the run that builds your base without wearing you out.',
  ]),
  bodyEffort('Long Run', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Run your longest, slowest run of the week.',
    'Start easy, drink water and walk if you need to.',
  ]),
  bodyEffort('Tempo Run', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Warm up, then run comfortably hard for 15 to 25 minutes.',
    'Finish with an easy jog or walk.',
  ]),
  bodyEffort('Fartlek Run', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Mix short surges with easy running, deciding as you go.',
    'Log the whole run as one effort.',
  ]),
  bodyEffort('Trail Run', ['quads', 'glutes'], ['calves', 'hamstrings', 'abductors'], [
    'Shorten your stride and watch the ground a few steps ahead.',
    'Walk the steep climbs and take the descents slowly.',
  ]),
  bodyEffort('Recovery Run', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Run very easily, slower than you think you should.',
    'It should feel like a warm-up the whole way.',
  ]),
  bodyRounds('Hill Repeats', ['glutes', 'quads'], ['calves', 'hamstrings'], [
    'Run hard up a hill, then walk back down to recover.',
    'Each logged set is one climb.',
  ]),
  bodyRounds('Strides', ['quads', 'hamstrings'], ['calves', 'glutes'], [
    'After an easy run, accelerate smoothly to fast-but-relaxed for about 20 seconds.',
    'Walk back and repeat. Each logged set is one stride.',
  ]),
  bodyEffort('5K Race', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Warm up well, start a touch slower than you feel like, and pick it up in the second half.',
    'Log your finish time and 5 km (3.1 mi).',
  ]),
  bodyEffort('10K Race', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Start conservatively and settle into a pace you can hold.',
    'Log your finish time and 10 km (6.2 mi).',
  ]),
  bodyEffort('Half Marathon', ['quads', 'calves'], ['hamstrings', 'glutes'], [
    'Fuel and drink early, and start slower than goal pace.',
    'Log your finish time and 21.1 km (13.1 mi).',
  ]),
  bodyRounds('Stadium Stairs', ['glutes', 'quads'], ['calves', 'hamstrings'], [
    'Climb the steps at a steady pace, one or two at a time.',
    'Walk down to recover. Each logged set is one climb.',
  ]),
  bodyEffort('Ruck (Weighted Pack)', ['glutes', 'quads'], ['calves', 'hamstrings', 'lower_back', 'traps'], [
    'Load a pack with a manageable weight and snug the straps high on your back.',
    'Walk briskly with a tall posture. Log the time and distance, and note the pack weight.',
  ]),
  bodyEffort('Weighted Vest Walk', ['glutes', 'calves'], ['quads', 'hamstrings'], [
    'Wear a vest that is no more than about 10% of your bodyweight.',
    'Walk briskly and stand tall.',
  ]),
  bodyRounds('Walking Intervals', ['calves'], ['quads', 'glutes'], [
    'Alternate one to three minutes of fast walking with easy walking.',
    'Each logged set is one fast interval.',
  ]),
]

export const MACHINES: CatalogEntry[] = [
  machineRounds('Elliptical Intervals', ['quads'], ['glutes', 'hamstrings'], [
    'Alternate hard resistance or speed with easy recovery.',
    'Each logged set is one hard interval.',
  ]),
  machineEffort('Elliptical (Reverse Stride)', ['hamstrings', 'glutes'], ['quads', 'calves'], [
    'Pedal backward at a comfortable resistance with your chest tall.',
    consoleNote,
  ]),
  machineEffort('Arc Trainer (AMT)', ['glutes', 'quads'], ['hamstrings', 'calves'], [
    'Set an incline and resistance, then keep a smooth, natural stride.',
    consoleNote,
  ]),
  machineRounds('Stair Climber Intervals', ['glutes', 'quads'], ['calves', 'hamstrings'], [
    'Alternate one to two minutes of faster stepping with easy recovery.',
    'Each logged set is one hard interval.',
  ]),
  machineEffort('Stepmill (Rotating Staircase)', ['glutes', 'quads'], ['calves', 'hamstrings'], [
    'Step onto the moving stairs and stand tall without leaning on the rails.',
    consoleNote,
  ]),
  machineEffort('Upright Bike', ['quads'], ['glutes', 'hamstrings', 'calves'], [
    'Set the seat so your knee is slightly bent at the bottom of the stroke.',
    consoleNote,
  ]),
  machineEffort('Recumbent Bike', ['quads'], ['glutes', 'hamstrings'], [
    'Adjust the seat so your knee has a slight bend at the far end of the stroke.',
    consoleNote,
  ]),
  machineRounds('Bike Intervals', ['quads'], ['glutes', 'hamstrings', 'calves'], [
    'Alternate hard, fast pedalling with easy spinning.',
    'Each logged set is one hard interval.',
  ]),
  machineEffort('Indoor Zone 2 Bike', ['quads'], ['glutes', 'hamstrings', 'calves'], [
    'Ride at a steady pace where you can still talk in full sentences.',
    consoleNote,
  ]),
  machineRounds('Air Bike Intervals', ['quads'], ['glutes', 'front_delts', 'triceps'], [
    'Alternate hard effort with easy pedalling. The harder you push, the harder it gets.',
    'Each logged set is one hard interval.',
  ]),
  machineEffort('Rower Intervals', ['upper_back', 'lats'], ['quads', 'hamstrings', 'biceps'], [
    'Row hard for a set distance or time, then paddle easily to recover.',
    'Each logged set is one hard interval with its time and distance.',
  ]),
  machineEffort('Rower 2K Test', ['upper_back', 'lats'], ['quads', 'hamstrings', 'biceps'], [
    'Warm up, then row 2,000 metres at the hardest pace you can hold.',
    'Log your finish time and the distance.',
  ]),
  machineEffort('Rower Zone 2', ['upper_back', 'lats'], ['quads', 'hamstrings', 'biceps'], [
    'Row at an easy, steady pace where you can hold a conversation.',
    consoleNote,
  ]),
  machineEffort('Ski Erg Intervals', ['lats'], ['triceps', 'abs', 'glutes'], [
    'Alternate hard pulls with easy recovery, hinging at the hips each stroke.',
    'Each logged set is one hard interval with its time and distance.',
  ]),
]

export const CONDITIONING: CatalogEntry[] = [
  activity('cardio', 'time', 'other')('Battle Rope Alternating Waves', ['front_delts'], ['forearms', 'abs', 'biceps'], [
    'Hold a half squat and make fast alternating waves with both arms.',
    'Each logged set is one round.',
  ]),
  activity('cardio', 'time', 'other')('Battle Rope Double Slams', ['front_delts', 'lats'], ['abs', 'forearms', 'glutes'], [
    'Raise both ropes overhead, then slam them down hard with your whole body.',
    'Each logged set is one round.',
  ]),
  activity('cardio', 'time', 'other')('Battle Rope Jacks', ['front_delts'], ['calves', 'forearms', 'abs'], [
    'Jump your feet wide as you sweep the ropes out and up, then bring them back together.',
    'Each logged set is one round.',
  ]),
  activity('cardio', 'time', 'other')('Jump Rope Intervals', ['calves'], ['forearms', 'front_delts'], [
    'Skip for a hard round, then rest or march in place.',
    'Each logged set is one round.',
  ]),
  activity('cardio', 'time', 'bodyweight')('Tabata Intervals', ['quads'], ['glutes', 'abs', 'chest'], [
    'Work all out for 20 seconds, rest for 10, and repeat eight times.',
    'Each logged set is one 20-second round.',
  ]),
  activity('cardio', 'time', 'bodyweight')('EMOM Workout', ['quads'], ['glutes', 'abs', 'chest'], [
    'Do a set amount of work at the start of every minute and rest for what is left.',
    'Each logged set is one minute.',
  ]),
  activity('cardio', 'time', 'bodyweight')('AMRAP Circuit', ['quads'], ['glutes', 'abs', 'chest'], [
    'Cycle through a short list of moves for a set time and count your rounds.',
    'Log the whole block as one set.',
  ]),
  activity('cardio', 'time', 'other')('Circuit Training', ['quads'], ['glutes', 'abs', 'chest'], [
    'Move through stations with little rest between them.',
    'Each logged set is one round of the circuit.',
  ]),
  activity('cardio', 'time', 'bodyweight')('Cardio Finisher (5 Minutes)', ['quads'], ['glutes', 'abs'], [
    'After lifting, pick one move and keep going for five minutes with brief rests.',
    'Log the whole block as one set.',
  ]),
  activity('cardio', 'time', 'kettlebell')('Kettlebell Swing Intervals', ['glutes', 'hamstrings'], ['lower_back', 'abs', 'front_delts'], [
    'Swing for a hard round with your hips doing the work, then rest.',
    'Each logged set is one round.',
  ]),
  activity('cardio', 'time', 'bodyweight')('Lateral Shuffle', ['abductors', 'quads'], ['glutes', 'calves', 'adductors'], [
    'Stay low in an athletic stance and shuffle sideways without crossing your feet.',
    'Each logged set is one round, then switch direction.',
  ]),
  activity('cardio', 'time', 'bodyweight')('Skater Bounds', ['glutes', 'abductors'], ['quads', 'calves'], [
    'Bound side to side landing softly on one leg with your other leg behind.',
    'Each logged set is one round.',
  ]),
]

export const OUTDOOR_AND_SWIM: CatalogEntry[] = [
  activity('cardio', 'distance', 'other')('Road Ride', ['quads'], ['glutes', 'hamstrings', 'calves'], [
    'Ride at a steady effort and shift early on hills.',
    'Log the time and distance from your bike computer or phone.',
  ]),
  activity('cardio', 'distance', 'other')('Mountain Bike Ride', ['quads', 'glutes'], ['hamstrings', 'calves', 'forearms'], [
    'Stay loose, look ahead and let the bike move under you.',
    'Log the time and distance from your bike computer or phone.',
  ]),
  activity('cardio', 'distance', 'other')('Gravel Ride', ['quads', 'glutes'], ['hamstrings', 'calves'], [
    'Ride at a steady effort and choose your line on loose surfaces.',
    'Log the time and distance from your bike computer or phone.',
  ]),
  activity('cardio', 'distance', 'other')('Bike Commute', ['quads'], ['glutes', 'calves'], [
    'Ride to class or work at an easy, steady pace. It counts.',
    'Log the time and distance.',
  ]),
  activity('swim', 'distance', 'other')('Lap Swim (Freestyle Intervals)', ['lats'], ['front_delts', 'triceps', 'abs'], [
    'Swim hard for a set distance, then rest on the wall.',
    'Log each repeat as its own set with its time and distance.',
  ]),
  activity('swim', 'distance', 'other')('Aqua Jogging', ['quads', 'glutes'], ['calves', 'hamstrings', 'abs'], [
    'Run in deep water with a tall posture and no impact.',
    'Log the time; distance is optional.',
  ]),
  activity('swim', 'distance', 'other')('IM Swim Set', ['lats', 'chest'], ['front_delts', 'triceps', 'abs'], [
    'Swim butterfly, backstroke, breaststroke, then freestyle in order.',
    'Log the whole set with its time and distance.',
  ]),
  activity('swim', 'distance', 'other')('Swim Pyramid', ['lats'], ['front_delts', 'triceps', 'abs'], [
    'Build up the distance of each repeat, then come back down, for example 50, 100, 150, 100, 50.',
    'Log the whole set with its time and distance.',
  ]),
  activity('swim', 'distance', 'other')('Swim Drills (Catch-Up)', ['lats'], ['front_delts', 'triceps', 'abs'], [
    'Keep one arm extended until the other hand touches it, then switch.',
    'Focus on a long, smooth pull. Log the time and distance.',
  ]),
]

export const COMBAT_AND_SPORT: CatalogEntry[] = [
  activity('combat', 'time', 'other')('Heavy Bag Rounds', ['front_delts', 'chest'], ['triceps', 'obliques', 'calves'], [
    'Throw combinations for the round and move around the bag.',
    'Each logged set is one round.',
  ]),
  activity('combat', 'time', 'other')('Double-End Bag Rounds', ['front_delts'], ['obliques', 'calves'], [
    'Keep your hands up and time your punches as the bag rebounds.',
    'Each logged set is one round.',
  ]),
  activity('combat', 'time', 'bodyweight')('Boxing Footwork Drills', ['quads', 'calves'], ['glutes', 'abductors'], [
    'Practise stance, step-and-slide, pivots and angle changes with your hands up.',
    'Each logged set is one round.',
  ]),
  activity('combat', 'time', 'other')('Muay Thai Class', ['quads', 'glutes'], ['obliques', 'front_delts', 'abs'], [
    'A whole class of strikes, clinch and conditioning. Log it as one set.',
  ]),
  activity('combat', 'time', 'other')('Jiu-Jitsu Class', ['forearms', 'abs'], ['quads', 'glutes', 'lats'], [
    'A whole class of drills and rolling. Log it as one set.',
  ]),
  activity('combat', 'time', 'other')('Wrestling Practice', ['quads', 'glutes'], ['upper_back', 'forearms', 'abs'], [
    'A whole practice of drilling and live wrestling. Log it as one set.',
  ]),
  activity('sport', 'distance', 'other')('Bouldering', ['forearms', 'lats'], ['biceps', 'abs', 'calves'], [
    'Climb problems on the bouldering wall and rest between attempts.',
    'Log the time you climbed. Rest your fingers when they get sore.',
  ]),
  activity('sport', 'distance', 'other')('Badminton', ['quads', 'calves'], ['front_delts', 'forearms'], [
    'Log the time you played.',
  ]),
  activity('sport', 'distance', 'other')('Racquetball', ['quads', 'calves'], ['front_delts', 'obliques'], [
    'Log the time you played.',
  ]),
  activity('sport', 'distance', 'other')('Table Tennis', ['front_delts'], ['calves', 'forearms'], [
    'Log the time you played.',
  ]),
  activity('sport', 'distance', 'other')('Ultimate Frisbee', ['quads', 'hamstrings'], ['calves', 'glutes', 'front_delts'], [
    'Log the time you played.',
  ]),
  activity('sport', 'distance', 'other')('Flag Football', ['quads', 'hamstrings'], ['calves', 'glutes'], [
    'Log the time you played.',
  ]),
  activity('sport', 'distance', 'other')('Indoor Turf Soccer', ['quads', 'hamstrings'], ['calves', 'glutes'], [
    'Log the time you played.',
  ]),
  activity('sport', 'distance', 'other')('Intramural Game', ['quads', 'calves'], ['glutes', 'hamstrings'], [
    'Any intramural game. Log the time you played.',
  ]),
  activity('sport', 'distance', 'other')('Disc Golf', ['calves'], ['quads', 'obliques'], [
    'Log the round; distance walked is optional.',
  ]),
]

export const CLASSES: CatalogEntry[] = [
  activity('cardio', 'distance', 'other')('Group Fitness Class', ['quads'], ['glutes', 'abs', 'calves'], [
    'Any group fitness class. Log it as one set.',
  ]),
  activity('cardio', 'distance', 'other')('F45 Class', ['quads'], ['glutes', 'abs', 'chest'], [
    'A whole F45 session. Log it as one set.',
  ]),
  activity('cardio', 'distance', 'other')('Bootcamp Class', ['quads'], ['glutes', 'abs', 'chest'], [
    'A whole bootcamp class. Log it as one set.',
  ]),
  activity('cardio', 'distance', 'other')('HIIT Class', ['quads'], ['glutes', 'abs', 'chest'], [
    'A whole HIIT class. Log it as one set.',
  ]),
  activity('cardio', 'distance', 'other')('Step Aerobics', ['glutes', 'quads'], ['calves', 'hamstrings'], [
    'Follow the choreography and keep your steps light. Log the class as one set.',
  ]),
]
