// Barbell work: squat, hinge, press and row variations for the racks, the landmine, the EZ-bar,
// and the Olympic lifts (the CoRec has a dedicated Olympic lifting room with eight platforms).
import { lifts, type CatalogEntry } from './entry.ts'

const bar = lifts('barbell')

export const BARBELL_LEGS_AND_HINGE: CatalogEntry[] = [
  bar('Barbell Back Squat (High Bar)', ['quads', 'glutes'], ['hamstrings', 'adductors', 'lower_back'], [
    'Set the bar on your upper traps, feet shoulder-width, and brace your core.',
    'Sit down between your hips until your thighs are at least parallel, then drive up.',
  ]),
  bar('Barbell Back Squat (Low Bar)', ['quads', 'glutes'], ['hamstrings', 'adductors', 'lower_back'], [
    'Set the bar across your rear delts and lean into the hips a little more than a high-bar squat.',
    'Sit back and down to at least parallel, then drive up keeping your chest proud.',
  ]),
  bar('Barbell Pause Squat', ['quads', 'glutes'], ['hamstrings', 'adductors', 'lower_back'], [
    'Squat down and hold the bottom for a full one to two seconds, staying tight.',
    'Drive up without bouncing. Use less weight than your normal squat.',
  ]),
  bar('Barbell Box Squat', ['glutes', 'quads'], ['hamstrings', 'lower_back'], [
    'Set a box or bench behind you at about parallel height.',
    'Sit back onto it under control, stay tight, then stand up without rocking.',
  ]),
  bar('Barbell Zercher Squat', ['quads', 'glutes'], ['abs', 'upper_back', 'biceps'], [
    'Hold the bar in the crooks of your elbows against your stomach, using a pad if it bites.',
    'Squat down keeping your chest tall, then drive up.',
  ]),
  bar('Barbell Reverse Lunge', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Set the bar on your upper back and step one foot back into a lunge.',
    'Lower your back knee toward the floor, then push through your front foot to stand. Alternate legs.',
  ]),
  bar('Barbell Walking Lunge', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Set the bar on your upper back and take a long step forward.',
    'Lower your back knee toward the floor, then drive through the front foot into the next step.',
  ]),
  bar('Barbell Bulgarian Split Squat', ['quads', 'glutes'], ['hamstrings', 'adductors'], [
    'Rest your back foot on a bench and hold the bar on your upper back.',
    'Lower straight down until your front thigh is about parallel, then drive up. Log each leg as its own set.',
  ]),
  bar('Barbell Step-Up', ['quads', 'glutes'], ['hamstrings', 'calves'], [
    'Set the bar on your upper back and put one foot fully on a box.',
    'Drive through that heel to stand tall, then step down with control. Log each leg as its own set.',
  ]),
  bar('Barbell Hip Thrust', ['glutes'], ['hamstrings', 'quads'], [
    'Sit with your upper back on a bench and roll the padded bar over your hips.',
    'Drive your hips up until your torso is level, squeeze hard, then lower slowly.',
  ]),
  bar('Barbell Sumo Deadlift', ['glutes', 'quads', 'adductors'], ['hamstrings', 'lower_back', 'traps'], [
    'Take a wide stance with your toes turned out and hold the bar just inside your knees.',
    'Push the floor away, keep the bar close, then lock out with your hips and knees together.',
  ]),
  bar('Barbell Deficit Deadlift', ['hamstrings', 'glutes', 'lower_back'], ['quads', 'traps'], [
    'Stand on a low platform (an inch or two) and set up like a normal deadlift.',
    'Keep your back flat, pull the slack out of the bar, then stand up.',
  ]),
  bar('Barbell Rack Pull', ['upper_back', 'traps', 'lower_back'], ['glutes', 'hamstrings'], [
    'Set the bar on pins at about knee height.',
    'Pull the bar into your thighs with a flat back and squeeze your shoulder blades at the top.',
  ]),
  bar('Trap Bar Deadlift', ['glutes', 'quads', 'hamstrings'], ['lower_back', 'traps'], [
    'Step inside the hex bar and grab the handles with a flat back.',
    'Push the floor away and stand tall, then lower the bar under control.',
  ]),
  bar('Barbell Stiff-Leg Deadlift', ['hamstrings'], ['glutes', 'lower_back'], [
    'Hold the bar at your thighs with your knees only slightly bent.',
    'Hinge at the hips and lower the bar along your legs until you feel a big hamstring stretch, then stand.',
  ]),
]

export const BARBELL_PRESSING: CatalogEntry[] = [
  bar('Barbell Standing Overhead Press', ['front_delts', 'side_delts'], ['triceps', 'upper_back', 'abs'], [
    'Hold the bar at your collarbone, squeeze your glutes and brace your core.',
    'Press straight overhead and move your head through, then lower under control.',
  ]),
  bar('Barbell Push Press', ['front_delts', 'side_delts'], ['triceps', 'quads'], [
    'Dip a few inches with an upright torso, then drive your legs to launch the bar.',
    'Finish overhead with locked arms and lower to your collarbone.',
  ]),
  bar('Barbell Pause Bench Press', ['chest'], ['triceps', 'front_delts'], [
    'Lower the bar to your chest and hold it still for a full second.',
    'Press explosively without bouncing. Use less weight than your normal bench.',
  ]),
  bar('Barbell Wide-Grip Bench Press', ['chest'], ['front_delts', 'triceps'], [
    'Grab the bar wider than your normal grip, but keep your wrists stacked over your elbows.',
    'Lower to your chest with control and press up.',
  ]),
  bar('Barbell Decline Bench Press', ['chest'], ['triceps', 'front_delts'], [
    'Lock your legs in on a decline bench and unrack the bar with a spotter.',
    'Lower to your lower chest and press back up.',
  ]),
  bar('Barbell Floor Press', ['chest', 'triceps'], ['front_delts'], [
    'Lie on the floor with your knees bent and lower until your triceps touch down.',
    'Pause briefly, then press back up.',
  ]),
  bar('Barbell Spoto Press', ['chest'], ['triceps', 'front_delts'], [
    'Lower the bar until it stops about an inch above your chest and hold it there.',
    'Press back up without bouncing. Use less weight than your normal bench.',
  ]),
  bar('Landmine Press', ['front_delts', 'chest'], ['triceps', 'abs'], [
    'Wedge one end of the bar into a corner or landmine and hold the other end at your shoulder.',
    'Press up and slightly forward, then lower slowly. Log each arm as its own set if pressing one-handed.',
  ]),
  bar('Half-Kneeling Landmine Press', ['front_delts'], ['chest', 'triceps', 'obliques'], [
    'Kneel on the knee opposite the pressing arm with the bar end at your shoulder.',
    'Press up and forward, staying tall. Log each arm as its own set.',
  ]),
  bar('Barbell Thruster', ['quads', 'front_delts'], ['glutes', 'triceps', 'abs'], [
    'Hold the bar on your shoulders and squat down.',
    'Drive up and press the bar overhead in one motion, then lower to your shoulders.',
  ]),
  bar('EZ-Bar Skull Crusher', ['triceps'], ['chest'], [
    'Lie on a bench with an EZ-bar over your forehead and elbows pointing up.',
    'Bend your elbows to lower the bar toward your forehead, then extend.',
  ]),
  bar('Barbell JM Press', ['triceps'], ['chest', 'front_delts'], [
    'Lie on a bench and lower the bar toward your chin with your elbows tucked.',
    'Stop just above your throat, then press back up.',
  ]),
  bar('Barbell Landmine Squat to Press', ['quads', 'front_delts'], ['glutes', 'triceps', 'abs'], [
    'Hold the end of a landmine bar at your chest and squat down.',
    'Drive up and press the bar overhead in one motion.',
  ]),
]

export const BARBELL_PULLING_AND_ARMS: CatalogEntry[] = [
  bar('Barbell Pendlay Row', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'lower_back'], [
    'Set the bar on the floor, hinge until your back is parallel to it and grab it overhand.',
    'Row explosively to your lower chest, then return the bar to the floor between reps.',
  ]),
  bar('Barbell Yates Row', ['upper_back', 'lats'], ['biceps', 'rear_delts'], [
    'Hold the bar underhand with your torso at about 45 degrees.',
    'Row to your belly, squeeze, then lower under control.',
  ]),
  bar('Barbell Reverse-Grip Row', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [
    'Hold the bar underhand and hinge forward with a flat back.',
    'Row to your belly with your elbows close, then lower under control.',
  ]),
  bar('Landmine Row', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'lower_back'], [
    'Straddle the bar end, hinge forward and hold the handle or the sleeve.',
    'Row toward your ribs, squeeze, then lower under control.',
  ]),
  bar('EZ-Bar Curl', ['biceps'], ['forearms'], [
    'Hold the EZ-bar on the angled grips and keep your elbows at your sides.',
    'Curl up without swinging, then lower slowly.',
  ]),
  bar('EZ-Bar Preacher Curl', ['biceps'], ['forearms'], [
    'Rest your upper arms on the pad and hold the EZ-bar.',
    'Curl up, then lower until your arms are nearly straight.',
  ]),
  bar('EZ-Bar Reverse Curl', ['forearms', 'biceps'], [], [
    'Hold the EZ-bar overhand on the angled grips.',
    'Curl up with your wrists straight, then lower slowly.',
  ]),
  bar('Barbell Drag Curl', ['biceps'], ['front_delts'], [
    'Curl the bar up while pulling your elbows back so the bar drags up your torso.',
    'Lower slowly and keep the bar close.',
  ]),
]

export const OLYMPIC_LIFTS: CatalogEntry[] = [
  bar('Power Clean', ['glutes', 'quads', 'traps'], ['hamstrings', 'lower_back', 'front_delts'], [
    'Pull the bar off the floor, then extend your hips and knees hard and shrug.',
    'Pull yourself under and catch the bar on your shoulders in a quarter squat.',
  ]),
  bar('Hang Power Clean', ['glutes', 'quads', 'traps'], ['hamstrings', 'lower_back', 'front_delts'], [
    'Start with the bar at your knees, hips back and back flat.',
    'Extend explosively, shrug, and catch the bar on your shoulders in a quarter squat.',
  ]),
  bar('Hang Clean', ['glutes', 'quads', 'traps'], ['hamstrings', 'lower_back', 'front_delts'], [
    'Start with the bar at your knees, hips back and back flat.',
    'Extend explosively, shrug, and catch the bar in a full front squat.',
  ]),
  bar('Squat Clean', ['glutes', 'quads', 'traps'], ['hamstrings', 'lower_back', 'front_delts'], [
    'Pull the bar off the floor and extend your hips and knees hard.',
    'Drop under the bar and catch it on your shoulders in a full squat, then stand.',
  ]),
  bar('Power Snatch', ['glutes', 'quads', 'traps'], ['hamstrings', 'front_delts', 'upper_back'], [
    'Take a wide grip, pull the bar off the floor and extend explosively.',
    'Pull under and catch it overhead in a quarter squat with locked arms.',
  ]),
  bar('Hang Power Snatch', ['glutes', 'quads', 'traps'], ['hamstrings', 'front_delts', 'upper_back'], [
    'Start with the bar at your knees with a wide grip.',
    'Extend explosively and catch the bar overhead in a quarter squat.',
  ]),
  bar('Squat Snatch', ['glutes', 'quads', 'traps'], ['hamstrings', 'front_delts', 'upper_back'], [
    'Pull the bar off the floor with a wide grip and extend explosively.',
    'Drop into a full overhead squat, stabilise, then stand.',
  ]),
  bar('Clean and Jerk', ['glutes', 'quads', 'front_delts'], ['traps', 'triceps', 'hamstrings'], [
    'Clean the bar to your shoulders, then dip and drive the bar overhead with your legs.',
    'Catch it with locked arms, then stand tall and lower it under control.',
  ]),
  bar('Push Jerk', ['front_delts', 'triceps', 'quads'], ['glutes', 'abs'], [
    'Dip with an upright torso, then drive hard and punch the bar overhead.',
    'Catch it in a quarter squat with locked arms, then stand.',
  ]),
  bar('Split Jerk', ['front_delts', 'triceps', 'quads'], ['glutes', 'abs'], [
    'Dip, drive the bar overhead and split your feet front and back.',
    'Lock out the arms, then bring your feet together to finish.',
  ]),
  bar('Clean Pull', ['glutes', 'hamstrings', 'traps'], ['quads', 'lower_back', 'upper_back'], [
    'Pull the bar from the floor like a clean and finish with a full extension and shrug.',
    'Let the bar drop back under control without catching it.',
  ]),
  bar('Snatch Pull', ['glutes', 'hamstrings', 'traps'], ['quads', 'lower_back', 'upper_back'], [
    'Take a wide grip and pull the bar from the floor to a full extension and shrug.',
    'Let the bar drop back under control without catching it.',
  ]),
  bar('Overhead Squat', ['quads', 'glutes'], ['front_delts', 'upper_back', 'abs'], [
    'Hold the bar overhead with a wide grip and locked arms.',
    'Squat down keeping the bar over your midfoot, then stand.',
  ]),
  bar('Snatch Balance', ['quads', 'front_delts'], ['upper_back', 'abs'], [
    'Start with the bar on your back with a wide grip and dip.',
    'Drop under the bar into an overhead squat and stand.',
  ]),
]
