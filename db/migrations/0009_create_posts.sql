
create table posts (
  id integer primary key autoincrement,
  uid text not null,
  title text not null,
  content text not null,
  board text not null,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists posts_board_uid on posts (board, uid);

alter table senseis add column role text not null default "guest";
