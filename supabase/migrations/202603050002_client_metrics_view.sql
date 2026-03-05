drop view if exists client_metrics;

create view client_metrics as
select
  c.id as client_id,
  c.name,
  c.goal,
  c.program_id,
  c.coach_id,
  count(w.id)::int as total_sessions,
  count(*) filter (where w.status = 'completed')::int as completed_sessions,
  count(*) filter (where w.status = 'missed')::int as missed_sessions,
  coalesce(
    round(
      100.0 * count(*) filter (where w.status = 'completed') / nullif(count(w.id), 0),
      1
    ),
    0
  ) as adherence,
  case
    when coalesce(100.0 * count(*) filter (where w.status = 'completed') / nullif(count(w.id), 0), 0) >= 70 then 'on_track'
    when coalesce(100.0 * count(*) filter (where w.status = 'completed') / nullif(count(w.id), 0), 0) >= 50 then 'at_risk'
    else 'critical'
  end as status
from clients c
left join workouts w
  on w.client_id = c.id
 and w.date >= current_date - interval '30 days'
group by c.id, c.name, c.goal, c.program_id, c.coach_id;

create index if not exists idx_workouts_client
  on workouts (client_id);

create index if not exists idx_workouts_date
  on workouts (date);

create index if not exists idx_workouts_status
  on workouts (status);
