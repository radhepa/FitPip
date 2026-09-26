-- FitPip / activities beyond lifting: cardio, swimming, yoga, stretching, boxing, sports.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- * exercises.category says what kind of activity it is (drives colour, icon and workout section).
-- * exercises.tracking says how it is logged:
--     'reps'     weight x reps (lifting, bodyweight reps)          -> sets.weight, sets.reps
--     'time'     timed holds or rounds (yoga poses, stretches, boxing rounds, planks)
--                                                                  -> sets.duration_seconds
--     'distance' one continuous effort, time and/or distance (runs, swims, rides, sports)
--                                                                  -> sets.duration_seconds, sets.distance_m
--   Existing exercises become 'strength' / 'reps', so nothing about them changes.
-- * sets.duration_seconds and sets.distance_m (always metres; the app converts for display).
-- * template_exercises.target_seconds: target hold / round / session length for timed items.
-- * user_settings.distance_unit: 'mi' or 'km' (swims show yards or metres to match).
-- * A starter bank of ~80 activities, added for every existing account and every new one.

-- ---------------------------------------------------------------------------
-- exercises.category / exercises.tracking

alter table public.exercises
  add column if not exists category text not null default 'strength',
  add column if not exists tracking text not null default 'reps';

alter table public.exercises drop constraint if exists exercises_category_check;
alter table public.exercises
  add constraint exercises_category_check
  check (category in ('strength', 'cardio', 'swim', 'yoga', 'stretch', 'combat', 'sport'));

alter table public.exercises drop constraint if exists exercises_tracking_check;
alter table public.exercises
  add constraint exercises_tracking_check
  check (tracking in ('reps', 'time', 'distance'));

-- ---------------------------------------------------------------------------
-- sets: time and distance

alter table public.sets
  add column if not exists duration_seconds integer,
  add column if not exists distance_m numeric(10, 2);

alter table public.sets drop constraint if exists sets_duration_seconds_check;
alter table public.sets
  add constraint sets_duration_seconds_check
  check (duration_seconds is null or duration_seconds between 1 and 86400);

alter table public.sets drop constraint if exists sets_distance_m_check;
alter table public.sets
  add constraint sets_distance_m_check
  check (distance_m is null or (distance_m > 0 and distance_m <= 1000000));

-- ---------------------------------------------------------------------------
-- template_exercises: target length for timed items

alter table public.template_exercises
  add column if not exists target_seconds integer;

alter table public.template_exercises drop constraint if exists template_exercises_target_seconds_check;
alter table public.template_exercises
  add constraint template_exercises_target_seconds_check
  check (target_seconds is null or target_seconds between 1 and 86400);

-- ---------------------------------------------------------------------------
-- user_settings: distance unit

alter table public.user_settings
  add column if not exists distance_unit text not null default 'mi';

alter table public.user_settings drop constraint if exists user_settings_distance_unit_check;
alter table public.user_settings
  add constraint user_settings_distance_unit_check
  check (distance_unit in ('km', 'mi'));

-- ---------------------------------------------------------------------------
-- The starter activities (hand-written; the lifting bank is generated from ExerciseDB).

create or replace function public.starter_activity_catalog()
returns table (
  name              text,
  category          text,
  tracking          text,
  primary_muscles   public.muscle[],
  secondary_muscles public.muscle[],
  equipment         public.equipment_type,
  instructions      text[]
)
language sql
immutable
set search_path = ''
as $$
  select
    v.name,
    v.category,
    v.tracking,
    v.primary_muscles::public.muscle[],
    v.secondary_muscles::public.muscle[],
    v.equipment::public.equipment_type,
    v.instructions
  from (values
    -- Cardio ---------------------------------------------------------------
    ('Outdoor Run', 'cardio', 'distance', '{quads,calves}', '{hamstrings,glutes}', 'bodyweight', array['Start with five minutes of easy running to warm up.', 'Keep your posture tall and land softly under your hips.', 'Finish with a few minutes of walking.']),
    ('Treadmill Run', 'cardio', 'distance', '{quads,calves}', '{hamstrings,glutes}', 'machine', array['Set a 1% incline to mimic running outside.', 'Keep a relaxed arm swing and a quick, light step.', 'Log the distance and time from the console.']),
    ('Sprint Intervals', 'cardio', 'time', '{quads,hamstrings,glutes}', '{calves}', 'bodyweight', array['Warm up well first.', 'Sprint hard for the round, then walk or jog until you recover.', 'Each logged set is one sprint.']),
    ('Walk', 'cardio', 'distance', '{calves}', '{quads,glutes}', 'bodyweight', array['Walk at a pace where you can still talk.', 'Swing your arms and stand tall.']),
    ('Incline Walk', 'cardio', 'distance', '{glutes,calves}', '{hamstrings,quads}', 'machine', array['Set the treadmill to a steep incline and a brisk pace.', 'Do not hold the handrails.']),
    ('Hike', 'cardio', 'distance', '{quads,glutes}', '{calves,hamstrings}', 'bodyweight', array['Shorten your stride on climbs.', 'Take the descents slowly to spare your knees.']),
    ('Outdoor Cycling', 'cardio', 'distance', '{quads}', '{glutes,hamstrings,calves}', 'other', array['Set the saddle so your knee is slightly bent at the bottom of the stroke.', 'Spin smoothly and shift early on hills.']),
    ('Stationary Bike', 'cardio', 'distance', '{quads}', '{glutes,calves}', 'machine', array['Adjust the seat to hip height.', 'Keep a steady cadence and add resistance for climbs.']),
    ('Spin Class', 'cardio', 'distance', '{quads}', '{glutes,hamstrings,calves}', 'machine', array['Follow the instructor''s cadence and resistance calls.', 'Keep your core braced when standing on the pedals.']),
    ('Rowing Machine', 'cardio', 'distance', '{upper_back,lats}', '{quads,hamstrings,biceps}', 'machine', array['Drive with the legs, then swing the back, then pull the arms.', 'Return in reverse order: arms, back, legs.']),
    ('Elliptical', 'cardio', 'distance', '{quads}', '{glutes,hamstrings}', 'machine', array['Stand tall and push through your heels.', 'Use the handles to bring your arms into it.']),
    ('Stair Climber', 'cardio', 'distance', '{glutes,quads}', '{calves,hamstrings}', 'machine', array['Take full steps and stand up straight.', 'Lightly touch the rails for balance only.']),
    ('Jump Rope', 'cardio', 'time', '{calves}', '{forearms,front_delts}', 'other', array['Stay on the balls of your feet with small, quick hops.', 'Turn the rope from the wrists, not the shoulders.', 'Each logged set is one round.']),
    ('HIIT Circuit', 'cardio', 'time', '{quads}', '{glutes,abs,chest}', 'bodyweight', array['Work hard for the round, then rest for the same time or less.', 'Each logged set is one round.']),
    ('Burpees', 'cardio', 'reps', '{quads,chest}', '{front_delts,triceps,abs}', 'bodyweight', array['Squat, kick your feet back to a plank and lower your chest.', 'Jump the feet in and leap up with your arms overhead.']),
    ('Mountain Climbers', 'cardio', 'time', '{abs}', '{front_delts,quads}', 'bodyweight', array['Hold a high plank with your hips level.', 'Drive the knees towards your chest one at a time, quickly.']),
    ('Battle Ropes', 'cardio', 'time', '{front_delts}', '{forearms,abs,biceps}', 'other', array['Hold a half squat and brace your core.', 'Make fast alternating waves all the way to the anchor.']),
    ('Dance Cardio', 'cardio', 'distance', '{calves}', '{quads,glutes,abs}', 'bodyweight', array['Move with the music and keep your heart rate up.', 'Log the time; distance is optional.']),
    -- Swimming -------------------------------------------------------------
    ('Freestyle Swim', 'swim', 'distance', '{lats}', '{front_delts,triceps,abs}', 'other', array['Keep your body long and your head in line with your spine.', 'Rotate to breathe and pull through past your hip.']),
    ('Backstroke Swim', 'swim', 'distance', '{lats,rear_delts}', '{upper_back,abs}', 'other', array['Float flat with your ears in the water and eyes up.', 'Enter little finger first and keep a steady flutter kick.']),
    ('Breaststroke Swim', 'swim', 'distance', '{chest,adductors}', '{quads,front_delts}', 'other', array['Pull, breathe, kick, then glide.', 'Snap the feet together at the end of the kick.']),
    ('Butterfly Swim', 'swim', 'distance', '{lats,chest}', '{front_delts,abs,lower_back}', 'other', array['Drive from the chest with a two-beat dolphin kick.', 'Recover both arms together over the water.']),
    ('Kickboard Drills', 'swim', 'distance', '{glutes,quads}', '{hamstrings,calves}', 'other', array['Hold the board at arm''s length with your face in or out of the water.', 'Kick from the hips with loose ankles.']),
    ('Pull Buoy Laps', 'swim', 'distance', '{lats}', '{upper_back,triceps}', 'other', array['Hold the buoy between your thighs so the legs float still.', 'Focus on a long, strong pull.']),
    ('Treading Water', 'swim', 'time', '{quads}', '{adductors,front_delts}', 'other', array['Keep your head above water with an eggbeater or scissor kick.', 'Scull your hands in small circles.']),
    ('Open Water Swim', 'swim', 'distance', '{lats}', '{front_delts,triceps,abs}', 'other', array['Lift your eyes every few strokes to sight your line.', 'Swim with a buddy or where there is a lifeguard.']),
    ('Water Aerobics', 'swim', 'distance', '{quads}', '{glutes,front_delts}', 'other', array['Keep moving through the class; the water adds the resistance.']),
    -- Yoga -----------------------------------------------------------------
    ('Sun Salutation', 'yoga', 'time', '{front_delts,hamstrings}', '{triceps,abs}', 'bodyweight', array['Flow through mountain, forward fold, plank, cobra and downward dog.', 'One breath per movement. Each logged set is one round.']),
    ('Mountain Pose', 'yoga', 'time', '{}', '{abs,glutes}', 'bodyweight', array['Stand with feet together and weight spread evenly.', 'Lengthen through the crown of the head and relax the shoulders.']),
    ('Downward Dog', 'yoga', 'time', '{hamstrings,calves}', '{front_delts,upper_back}', 'bodyweight', array['From hands and knees, lift your hips up and back.', 'Press the floor away and let the heels sink towards the mat.']),
    ('Upward Dog', 'yoga', 'time', '{lower_back}', '{chest,triceps}', 'bodyweight', array['Lie face down, press up through straight arms.', 'Lift the thighs off the mat and open the chest forward.']),
    ('Cobra Pose', 'yoga', 'time', '{lower_back}', '{glutes}', 'bodyweight', array['Lie face down with hands under your shoulders.', 'Lift the chest with your back muscles, elbows soft and close.']),
    ('Child''s Pose', 'yoga', 'time', '{lower_back}', '{lats}', 'bodyweight', array['Kneel, sit back on your heels and fold forward.', 'Rest your forehead down and breathe into your back.']),
    ('Warrior I', 'yoga', 'time', '{quads,glutes}', '{front_delts,calves}', 'bodyweight', array['Step one foot back, bend the front knee over the ankle.', 'Square the hips forward and reach the arms overhead.']),
    ('Warrior II', 'yoga', 'time', '{quads,adductors}', '{side_delts,glutes}', 'bodyweight', array['Wide stance, front knee bent, back foot turned in slightly.', 'Arms out level with your shoulders, gaze over the front hand.']),
    ('Warrior III', 'yoga', 'time', '{glutes,hamstrings}', '{lower_back,abs}', 'bodyweight', array['Balance on one leg and tip forward until your body forms a T.', 'Keep the hips level and the back leg active.']),
    ('Tree Pose', 'yoga', 'time', '{glutes,abductors}', '{calves,abs}', 'bodyweight', array['Stand on one leg and place the other foot on your calf or thigh, not the knee.', 'Press foot and leg into each other and find a still point to look at.']),
    ('Triangle Pose', 'yoga', 'time', '{obliques,hamstrings}', '{adductors}', 'bodyweight', array['From a wide stance, reach forward then tip down to the shin.', 'Stack the shoulders and reach the top arm up.']),
    ('Chair Pose', 'yoga', 'time', '{quads,glutes}', '{front_delts,lower_back}', 'bodyweight', array['Sit back as if into a chair with feet together.', 'Reach the arms up and keep your weight in the heels.']),
    ('Plank Pose', 'yoga', 'time', '{abs}', '{front_delts,triceps,glutes}', 'bodyweight', array['Hands under shoulders, body in one straight line.', 'Squeeze the glutes and push the floor away.']),
    ('Side Plank', 'yoga', 'time', '{obliques}', '{abductors,side_delts}', 'bodyweight', array['Balance on one hand or forearm with feet stacked.', 'Lift the hips so your body is straight. Log each side as a set.']),
    ('Bridge Pose', 'yoga', 'time', '{glutes}', '{hamstrings,lower_back}', 'bodyweight', array['Lie on your back, knees bent, feet hip-width apart.', 'Press through the feet to lift the hips and roll the shoulders under.']),
    ('Boat Pose', 'yoga', 'time', '{abs}', '{obliques}', 'bodyweight', array['Sit, lean back and lift the shins parallel to the floor.', 'Keep the chest open and the back long.']),
    ('Crow Pose', 'yoga', 'time', '{triceps,abs}', '{forearms,front_delts}', 'bodyweight', array['Squat, plant the hands and rest the knees on the backs of your upper arms.', 'Lean forward until the feet float.']),
    ('Pigeon Pose', 'yoga', 'time', '{glutes}', '{abductors}', 'bodyweight', array['Bring one shin forward across the mat, back leg long.', 'Square the hips and fold forward if it feels good. Log each side.']),
    ('Cat-Cow', 'yoga', 'time', '{lower_back}', '{abs,upper_back}', 'bodyweight', array['On hands and knees, arch the back as you breathe in.', 'Round the spine as you breathe out. Move slowly.']),
    ('Seated Forward Fold', 'yoga', 'time', '{hamstrings}', '{lower_back,calves}', 'bodyweight', array['Sit with legs straight and hinge forward from the hips.', 'Keep the spine long rather than forcing your head down.']),
    ('Camel Pose', 'yoga', 'time', '{quads}', '{lower_back,abs}', 'bodyweight', array['Kneel, hands on your lower back, and lift the chest.', 'Reach back for the heels only if it feels easy.']),
    ('Half Moon Pose', 'yoga', 'time', '{glutes,obliques}', '{abductors,hamstrings}', 'bodyweight', array['From triangle, bend the front knee and reach the hand forward.', 'Lift the back leg and open the hips and chest to the side.']),
    ('Savasana', 'yoga', 'time', '{}', '{}', 'bodyweight', array['Lie on your back with arms and legs relaxed.', 'Let the breath slow and stay still.']),
    ('Yoga Flow', 'yoga', 'time', '{abs}', '{hamstrings,front_delts,glutes}', 'bodyweight', array['A full practice or class. Log the whole session as one set.']),
    ('Pilates', 'yoga', 'time', '{abs}', '{obliques,glutes,lower_back}', 'bodyweight', array['Move with control and keep the core engaged throughout.', 'Log the whole session as one set.']),
    -- Stretching -------------------------------------------------------------
    ('Standing Hamstring Stretch', 'stretch', 'time', '{hamstrings}', '{calves}', 'bodyweight', array['Put one heel on a low step, leg straight.', 'Hinge forward from the hips until you feel the back of the thigh.']),
    ('Standing Quad Stretch', 'stretch', 'time', '{quads}', '{}', 'bodyweight', array['Stand tall and pull one heel towards your glutes.', 'Keep the knees together and tuck the pelvis slightly.']),
    ('Kneeling Hip Flexor Stretch', 'stretch', 'time', '{quads}', '{glutes}', 'bodyweight', array['Half kneel with one foot forward.', 'Squeeze the back glute and shift your hips forward gently.']),
    ('Figure-4 Stretch', 'stretch', 'time', '{glutes}', '{abductors}', 'bodyweight', array['Lie on your back and cross one ankle over the other knee.', 'Pull the bottom thigh towards your chest.']),
    ('Butterfly Stretch', 'stretch', 'time', '{adductors}', '{}', 'bodyweight', array['Sit with the soles of the feet together.', 'Sit tall and let the knees fall towards the floor.']),
    ('Doorway Chest Stretch', 'stretch', 'time', '{chest}', '{front_delts}', 'bodyweight', array['Put your forearm on a door frame, elbow at shoulder height.', 'Step through until you feel the chest open.']),
    ('Cross-Body Shoulder Stretch', 'stretch', 'time', '{rear_delts}', '{upper_back}', 'bodyweight', array['Bring one arm across your chest.', 'Hold it close with the other arm, shoulders down.']),
    ('Overhead Triceps Stretch', 'stretch', 'time', '{triceps}', '{lats}', 'bodyweight', array['Reach one hand down between your shoulder blades.', 'Gently press the elbow with the other hand.']),
    ('Lat Stretch', 'stretch', 'time', '{lats}', '{obliques}', 'bodyweight', array['Hold a post or rack with one hand and sit your hips back and away.', 'Feel the stretch along the side of your back.']),
    ('Calf Stretch', 'stretch', 'time', '{calves}', '{}', 'bodyweight', array['Hands on a wall, one foot back with the heel down.', 'Lean in until you feel the calf; bend the knee to reach deeper.']),
    ('Seated Spinal Twist', 'stretch', 'time', '{obliques}', '{lower_back,glutes}', 'bodyweight', array['Sit tall, cross one foot over the other knee.', 'Turn towards the bent knee using your breath, not force.']),
    ('Neck Stretch', 'stretch', 'time', '{traps}', '{}', 'bodyweight', array['Sit tall and tilt one ear towards your shoulder.', 'Let the opposite shoulder drop away.']),
    ('Wrist Stretch', 'stretch', 'time', '{forearms}', '{}', 'bodyweight', array['Arm straight, gently pull the fingers back, then forward.', 'Hold each direction.']),
    ('World''s Greatest Stretch', 'stretch', 'time', '{hamstrings,quads}', '{glutes,upper_back,adductors}', 'bodyweight', array['Lunge forward and put the same-side hand down inside the foot.', 'Rotate the other arm to the ceiling, then switch sides.']),
    ('Foam Rolling', 'stretch', 'time', '{}', '{}', 'other', array['Roll slowly over each muscle and pause on tight spots.', 'Avoid rolling directly on joints or the lower back.']),
    -- Boxing and combat -------------------------------------------------------
    ('Shadowboxing', 'combat', 'time', '{front_delts}', '{obliques,calves,triceps}', 'bodyweight', array['Stay light on your feet with your guard up.', 'Throw crisp combinations and move your head. Each set is one round.']),
    ('Heavy Bag', 'combat', 'time', '{front_delts,chest}', '{triceps,obliques,calves}', 'other', array['Wrap your hands and wear gloves.', 'Turn the hips into power shots and keep your guard between combinations.']),
    ('Speed Bag', 'combat', 'time', '{front_delts}', '{forearms,biceps}', 'other', array['Keep the fists at eye level and circle the bag with a steady rhythm.']),
    ('Focus Mitts', 'combat', 'time', '{front_delts}', '{obliques,triceps,calves}', 'other', array['Work combinations your partner calls.', 'Snap the punches back to your guard.']),
    ('Sparring', 'combat', 'time', '{front_delts}', '{obliques,calves,abs}', 'other', array['Always with a coach, gloves, headgear and a mouthguard.', 'Each set is one round.']),
    ('Kickboxing', 'combat', 'time', '{quads,glutes}', '{obliques,front_delts,calves}', 'other', array['Pivot on the standing foot as you kick.', 'Return to your stance after every combination.']),
    ('Boxing Class', 'combat', 'time', '{front_delts}', '{abs,calves,chest}', 'other', array['A whole class. Log it as one set.']),
    ('Martial Arts', 'combat', 'time', '{quads}', '{abs,front_delts,glutes}', 'other', array['Any class or practice session. Log it as one set.']),
    -- Sports and play ----------------------------------------------------------
    ('Basketball', 'sport', 'distance', '{quads,calves}', '{glutes,front_delts}', 'other', array['Log the time you played; distance is optional.']),
    ('Soccer', 'sport', 'distance', '{quads,hamstrings}', '{calves,glutes}', 'other', array['Log the time you played; distance is optional.']),
    ('Tennis', 'sport', 'distance', '{front_delts,quads}', '{obliques,calves}', 'other', array['Log the time you played.']),
    ('Pickleball', 'sport', 'distance', '{quads}', '{front_delts,calves}', 'other', array['Log the time you played.']),
    ('Volleyball', 'sport', 'distance', '{calves,quads}', '{front_delts}', 'other', array['Log the time you played.']),
    ('Rock Climbing', 'sport', 'distance', '{forearms,lats}', '{biceps,abs,calves}', 'other', array['Log the time you climbed.', 'Rest your fingers between hard attempts.']),
    ('Golf', 'sport', 'distance', '{obliques}', '{front_delts,glutes}', 'other', array['Log the round; distance walked is optional.']),
    ('Skating', 'sport', 'distance', '{glutes,quads}', '{adductors,abductors}', 'other', array['Log the time and, if you know it, the distance.'])
  ) as v (name, category, tracking, primary_muscles, secondary_muscles, equipment, instructions)
$$;

-- Adds any missing starter activities for one user (same-name rows are skipped).
create or replace function public.seed_starter_activities(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted integer;
begin
  insert into public.exercises
    (user_id, name, category, tracking, primary_muscles, secondary_muscles, equipment, instructions)
  select
    p_user_id, a.name, a.category, a.tracking, a.primary_muscles, a.secondary_muscles,
    a.equipment, a.instructions
  from public.starter_activity_catalog() a
  on conflict do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.seed_starter_activities(uuid) from public, anon, authenticated;

-- The starter bank now means lifts AND activities (new accounts, and the "Load starter
-- exercises" button in Settings). Replaces the version in 20260921000200_exercises.sql.
create or replace function public.seed_starter_exercises(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted integer;
begin
  insert into public.exercises
    (user_id, external_id, name, primary_muscles, secondary_muscles, equipment, image_url, instructions)
  select
    p_user_id, c.external_id, c.name, c.primary_muscles, c.secondary_muscles,
    c.equipment, c.image_url, c.instructions
  from public.starter_exercise_catalog() c
  on conflict do nothing;

  get diagnostics inserted = row_count;
  return inserted + public.seed_starter_activities(p_user_id);
end;
$$;

revoke all on function public.seed_starter_exercises(uuid) from public, anon, authenticated;

-- Existing accounts get the activities now (their lifts are left exactly as they are).
do $$
declare
  u record;
begin
  for u in select id from auth.users loop
    perform public.seed_starter_activities(u.id);
  end loop;
end $$;
