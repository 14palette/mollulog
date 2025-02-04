create table if not exists favorite_students (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  studentId text not null,
  contentId text not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create index if not exists favorite_students_userId on favorite_students (userId);
create unique index if not exists favorite_students_uid on favorite_students (uid);


create table if not exists future_content_memos (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  contentId text not null,
  body text not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create unique index if not exists future_content_memos_userId_contentId on future_content_memos (userId, contentId);
create unique index if not exists future_content_memos_uid on future_content_memos (uid);
