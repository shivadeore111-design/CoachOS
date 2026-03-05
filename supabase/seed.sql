-- Seed realistic CoachOS data for the currently authenticated coach.
-- Uses auth.uid() so rows are scoped to whoever runs the seed.

begin;

-- Coach profile
insert into coaches (id, email, name)
values (auth.uid(), 'coach@coachos.app', 'Coach Demo')
on conflict (id) do update
set email = excluded.email,
    name = excluded.name;

-- Replace existing coach-scoped data for a clean, repeatable seed.
delete from workouts where client_id in (select id from clients where coach_id = auth.uid());
delete from programs where id in (select program_id from clients where coach_id = auth.uid());
delete from clients where coach_id = auth.uid();

insert into programs (id, client_id, name, weekly_target, duration_weeks, type)
values
  ('7d1fb5d5-8c73-4f22-9d68-dc8c6eb99110', null, 'Strength Builder', 4, 12, 'strength'),
  ('f4d59466-ea4b-4c57-89c8-9afced466001', null, 'Fat Loss Accelerator', 5, 10, 'fat_loss'),
  ('f4be7f80-3c90-426e-87ef-c8895e9e7c22', null, 'Athletic Performance', 6, 16, 'athletic'),
  ('8239ac4f-d5eb-4a44-99ee-d5bb13f13877', null, 'Mobility & Recovery', 3, 8, 'mobility'),
  ('643658f3-3024-4d0c-b432-f8e27313f204', null, 'Hypertrophy Reload', 5, 14, 'strength'),
  ('631e989b-b05d-49a5-a616-c3ba40b4a625', null, 'Engine Builder', 4, 12, 'athletic'),
  ('afbaf61f-4828-4f2b-a57d-2cfcce6a68d6', null, 'Performance Lean', 5, 12, 'fat_loss'),
  ('7ce446de-8605-4684-b661-fb831bdb6835', null, 'Joint Health Flow', 3, 6, 'mobility');

insert into clients (id, coach_id, program_id, name, goal, email, phone)
values
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da001', auth.uid(), 'f4d59466-ea4b-4c57-89c8-9afced466001', 'Sarah Kim', 'Lose 12 lbs while improving energy', 'sarah.kim@example.com', '+1-415-555-0131'),
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da002', auth.uid(), 'f4be7f80-3c90-426e-87ef-c8895e9e7c22', 'Marcus Johnson', 'Increase speed and explosiveness for basketball', 'marcus.johnson@example.com', '+1-415-555-0132'),
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da003', auth.uid(), '631e989b-b05d-49a5-a616-c3ba40b4a625', 'Elena Rodriguez', 'Build endurance for a half-marathon', 'elena.rodriguez@example.com', '+1-415-555-0133'),
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da004', auth.uid(), '8239ac4f-d5eb-4a44-99ee-d5bb13f13877', 'Priya Patel', 'Reduce back pain and improve movement quality', 'priya.patel@example.com', '+1-415-555-0134'),
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da005', auth.uid(), '643658f3-3024-4d0c-b432-f8e27313f204', 'Tom Brady', 'Add lean muscle and maintain mobility', 'tom.brady@example.com', '+1-415-555-0135'),
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da006', auth.uid(), '7d1fb5d5-8c73-4f22-9d68-dc8c6eb99110', 'Jordan Lee', 'Increase strength and confidence in big lifts', 'jordan.lee@example.com', '+1-415-555-0136'),
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da007', auth.uid(), 'afbaf61f-4828-4f2b-a57d-2cfcce6a68d6', 'Deon Miles', 'Drop body fat while keeping performance high', 'deon.miles@example.com', '+1-415-555-0137'),
  ('16044a2f-4fbb-4f4e-b06b-6e6f821da008', auth.uid(), '7ce446de-8605-4684-b661-fb831bdb6835', 'Mei Chen', 'Improve flexibility and stay consistent', 'mei.chen@example.com', '+1-415-555-0138');

-- Session logs over the last 30 days (workouts table).
-- target_completion controls mixed adherence levels.
with client_patterns as (
  select * from (values
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da001'::uuid, 55, 'Cardio + resistance circuit'),
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da002'::uuid, 88, 'Speed and agility session'),
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da003'::uuid, 78, 'Endurance run + intervals'),
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da004'::uuid, 48, 'Mobility and core stability'),
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da005'::uuid, 74, 'Upper/lower split strength'),
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da006'::uuid, 92, 'Progressive strength training'),
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da007'::uuid, 58, 'Metabolic conditioning'),
    ('16044a2f-4fbb-4f4e-b06b-6e6f821da008'::uuid, 81, 'Yoga + mobility flow')
  ) as t(client_id, target_completion, workout_name)
), daily as (
  select
    cp.client_id,
    cp.target_completion,
    cp.workout_name,
    (current_date - gs.day_offset)::date as workout_date,
    gs.day_offset
  from client_patterns cp
  cross join lateral generate_series(0, 29) as gs(day_offset)
)
insert into workouts (client_id, date, status, notes, workout_type, duration_minutes)
select
  d.client_id,
  d.workout_date,
  case
    when ((extract(day from d.workout_date)::int * 37 + d.day_offset * 13) % 100) < d.target_completion
      then 'completed'
    else 'missed'
  end as status,
  case
    when ((extract(day from d.workout_date)::int * 37 + d.day_offset * 13) % 100) < d.target_completion
      then 'Completed with solid effort and good form.'
    else 'Missed due to schedule conflict; coach follow-up needed.'
  end as notes,
  d.workout_name,
  case
    when ((extract(day from d.workout_date)::int * 37 + d.day_offset * 13) % 100) < d.target_completion
      then 45 + ((d.day_offset * 7) % 30)
    else null
  end as duration_minutes
from daily d;

-- Optional tables: populate adherence_records/session_logs if they exist.
do $$
begin
  if to_regclass('public.adherence_records') is not null then
    execute $q$
      insert into adherence_records (coach_id, client_id, record_date, score)
      select
        auth.uid(),
        c.id,
        current_date - gs.day_offset,
        case
          when w.status = 'completed' then 70 + ((gs.day_offset * 11) % 31)
          else 40 + ((gs.day_offset * 7) % 21)
        end
      from clients c
      cross join lateral generate_series(0, 29) as gs(day_offset)
      left join workouts w
        on w.client_id = c.id
       and w.date = current_date - gs.day_offset
      where c.coach_id = auth.uid();
    $q$;
  end if;

  if to_regclass('public.session_logs') is not null then
    execute $q$
      insert into session_logs (user_id, client_id, session_date, summary)
      select
        auth.uid(),
        c.id,
        current_date - gs.day_offset,
        case
          when w.status = 'completed'
            then 'Session completed with positive energy and progress.'
          else 'Client no-show; rescheduled and sent accountability message.'
        end
      from clients c
      cross join lateral generate_series(0, 9) as gs(day_offset)
      left join workouts w
        on w.client_id = c.id
       and w.date = current_date - gs.day_offset
      where c.coach_id = auth.uid();
    $q$;
  end if;
end $$;

commit;
