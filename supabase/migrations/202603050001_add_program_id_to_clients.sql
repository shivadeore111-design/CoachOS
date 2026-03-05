alter table clients
add column program_id uuid references programs(id);
