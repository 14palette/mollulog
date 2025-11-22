create table pyroxene_planner_options (
  id integer primary key autoincrement,
  userId integer not null,
  options text not null,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists pyroxene_planner_options_userId on pyroxene_planner_options (userId);
