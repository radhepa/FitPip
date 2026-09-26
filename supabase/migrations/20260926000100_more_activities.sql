-- FitPip / more starter activities: everyday cardio, yoga poses and stretches.
-- Paste into the Supabase SQL Editor and run. Safe to re-run.
--
-- Needs 20260925000100_activities.sql to have been run first (it adds exercises.category / tracking
-- and the starter activity bank this extends).
--
-- The extra rows live in their own catalog function so the original one is left exactly as it was;
-- seed_starter_activities() now adds both. Existing accounts get the new rows below, new accounts
-- get them with the rest of the starter bank, and the "Load starter exercises" button in Settings
-- fills in anything missing. Same-name rows are skipped, so nothing you edited or added is touched.

create or replace function public.starter_activity_catalog_more()
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
    ('Jumping Jacks', 'cardio', 'time', '{calves}', '{quads,side_delts}', 'bodyweight', array['Jump your feet wide as your arms sweep overhead.', 'Jump back to standing and keep a steady rhythm.', 'Each logged set is one round.']),
    ('High Knees', 'cardio', 'time', '{quads}', '{abs,calves}', 'bodyweight', array['Run on the spot, driving each knee up to hip height.', 'Stay tall and pump your arms. Each logged set is one round.']),
    ('Butt Kicks', 'cardio', 'time', '{hamstrings}', '{calves,quads}', 'bodyweight', array['Jog on the spot and kick each heel up towards your glutes.', 'Keep your chest up and your knees pointing down. Each logged set is one round.']),
    ('Jump Squats', 'cardio', 'reps', '{quads,glutes}', '{calves,hamstrings}', 'bodyweight', array['Squat down, then explode up off the floor.', 'Land softly back into the squat and go again.']),
    ('Box Jumps', 'cardio', 'reps', '{quads,glutes}', '{calves,hamstrings}', 'other', array['Stand in front of a sturdy box and swing your arms back.', 'Jump up and land softly with both feet, hips back.', 'Step down instead of jumping down.']),
    ('Shuttle Runs', 'cardio', 'time', '{quads,calves}', '{hamstrings,glutes}', 'bodyweight', array['Mark two lines 10 to 20 metres apart.', 'Sprint to one, touch it, and sprint back. Each logged set is one round.']),
    ('Bear Crawl', 'cardio', 'time', '{front_delts,quads}', '{abs,triceps}', 'bodyweight', array['Crawl on hands and toes with your knees just off the floor.', 'Move opposite hand and foot together and keep your hips low.']),
    ('Treadmill Walk', 'cardio', 'distance', '{calves}', '{quads,glutes}', 'machine', array['Walk at a pace where you can still talk.', 'Stand tall and let your arms swing. Log the time and distance from the console.']),
    ('Assault Bike', 'cardio', 'distance', '{quads}', '{glutes,front_delts,triceps}', 'machine', array['Push and pull the handles while you pedal.', 'Ride steady or in hard intervals. Log the time and distance from the console.']),
    ('Ski Erg', 'cardio', 'distance', '{lats}', '{triceps,abs,glutes}', 'machine', array['Reach up, then pull the handles down as you hinge at the hips.', 'Keep it smooth. Log the time and distance from the console.']),
    -- Yoga -----------------------------------------------------------------
    ('Standing Forward Fold', 'yoga', 'time', '{hamstrings}', '{lower_back,calves}', 'bodyweight', array['Stand with feet hip-width apart and hinge forward from the hips.', 'Let the head and arms hang. Bend the knees if the backs of the legs are tight.']),
    ('Low Lunge', 'yoga', 'time', '{quads,glutes}', '{adductors}', 'bodyweight', array['Step one foot forward and lower the back knee to the mat.', 'Lift the chest and reach the arms up. Log each side.']),
    ('Extended Side Angle', 'yoga', 'time', '{obliques,quads}', '{adductors,side_delts}', 'bodyweight', array['From a wide lunge, rest the forearm on the front thigh.', 'Reach the other arm over your ear and turn the chest open.']),
    ('Wide-Legged Forward Fold', 'yoga', 'time', '{adductors,hamstrings}', '{lower_back}', 'bodyweight', array['Stand with your feet wide and fold forward with a long spine.', 'Let your hands walk to the floor and your head hang.']),
    ('Eagle Pose', 'yoga', 'time', '{abductors,upper_back}', '{quads,rear_delts}', 'bodyweight', array['Bend the knees and wrap one leg over the other.', 'Cross the arms in front and lift the elbows. Log each side.']),
    ('Garland Pose', 'yoga', 'time', '{adductors,glutes}', '{quads,calves,lower_back}', 'bodyweight', array['Squat low with your feet a little wider than your hips.', 'Press the elbows into the knees and lift the chest.']),
    ('Happy Baby', 'yoga', 'time', '{adductors}', '{lower_back,glutes}', 'bodyweight', array['Lie on your back and hold the outsides of your feet.', 'Draw the knees towards your armpits and rock gently.']),
    ('Reclined Twist', 'yoga', 'time', '{obliques}', '{lower_back,glutes}', 'bodyweight', array['Lie on your back and drop both knees to one side.', 'Open the opposite arm out and look the other way. Log each side.']),
    ('Legs Up the Wall', 'yoga', 'time', '{hamstrings}', '{lower_back,calves}', 'bodyweight', array['Sit sideways against a wall, then swing your legs up it.', 'Rest your arms by your sides and breathe slowly.']),
    ('Locust Pose', 'yoga', 'time', '{lower_back,glutes}', '{hamstrings,rear_delts}', 'bodyweight', array['Lie face down with your arms by your sides.', 'Lift the chest, arms and legs off the mat together.']),
    ('Sphinx Pose', 'yoga', 'time', '{lower_back}', '{abs,chest}', 'bodyweight', array['Lie face down and prop yourself up on your forearms.', 'Keep the elbows under your shoulders and lift the chest.']),
    ('Thread the Needle', 'yoga', 'time', '{rear_delts,upper_back}', '{traps}', 'bodyweight', array['From hands and knees, slide one arm under the other.', 'Rest the shoulder and cheek on the mat. Log each side.']),
    ('Lizard Pose', 'yoga', 'time', '{adductors,glutes}', '{hamstrings,quads}', 'bodyweight', array['From a low lunge, walk the front foot out to the side.', 'Sink the hips and lower to your forearms if you can. Log each side.']),
    ('Easy Pose', 'yoga', 'time', '{}', '{lower_back}', 'bodyweight', array['Sit cross-legged with a long spine.', 'Rest the hands on your knees and breathe slowly.']),
    ('Puppy Pose', 'yoga', 'time', '{lats}', '{upper_back,lower_back}', 'bodyweight', array['From hands and knees, walk the hands forward and melt the chest down.', 'Keep the hips over the knees.']),
    ('Bow Pose', 'yoga', 'time', '{quads,lower_back}', '{chest,front_delts}', 'bodyweight', array['Lie face down, bend the knees and hold your ankles.', 'Kick the feet back to lift the chest and thighs.']),
    ('Reclined Butterfly', 'yoga', 'time', '{adductors}', '{glutes}', 'bodyweight', array['Lie on your back with the soles of your feet together.', 'Let the knees fall open and rest your hands on your belly.']),
    ('Dolphin Pose', 'yoga', 'time', '{front_delts,hamstrings}', '{upper_back,calves}', 'bodyweight', array['Start in downward dog, then lower onto your forearms.', 'Walk the feet in and press the hips up and back.']),
    -- Stretching -----------------------------------------------------------
    ('Supine Hamstring Stretch', 'stretch', 'time', '{hamstrings}', '{calves}', 'bodyweight', array['Lie on your back and lift one leg, holding behind the thigh or calf.', 'Keep the other leg long on the floor. Log each side.']),
    ('Knee-to-Chest Stretch', 'stretch', 'time', '{glutes,lower_back}', '{}', 'bodyweight', array['Lie on your back and hug one knee towards your chest.', 'Keep the lower back on the floor. Log each side.']),
    ('Standing Side Bend', 'stretch', 'time', '{obliques}', '{lats}', 'bodyweight', array['Stand tall and reach one arm overhead.', 'Lean to the opposite side without twisting. Log each side.']),
    ('Frog Stretch', 'stretch', 'time', '{adductors}', '{glutes}', 'bodyweight', array['From hands and knees, slide the knees wide with the feet turned out.', 'Rock the hips back gently until you feel the inner thighs.']),
    ('Open Book Stretch', 'stretch', 'time', '{obliques}', '{upper_back,chest}', 'bodyweight', array['Lie on your side with the knees bent and the arms out in front.', 'Open the top arm across your body and follow it with your eyes. Log each side.'])
  ) as v (name, category, tracking, primary_muscles, secondary_muscles, equipment, instructions)
$$;

revoke all on function public.starter_activity_catalog_more() from public, anon, authenticated;

-- Adds any missing starter activities (the original set and the extras) for one user.
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
  from (
    select * from public.starter_activity_catalog()
    union all
    select * from public.starter_activity_catalog_more()
  ) a
  on conflict do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.seed_starter_activities(uuid) from public, anon, authenticated;

-- Existing accounts get the new activities now.
do $$
declare
  u record;
begin
  for u in select id from auth.users loop
    perform public.seed_starter_activities(u.id);
  end loop;
end $$;
