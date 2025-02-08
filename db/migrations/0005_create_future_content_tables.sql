create table if not exists content_favorite_students (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  studentId text not null,
  contentId text not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create unique index if not exists content_favorite_students_userId_contentId_studentId on content_favorite_students (userId, contentId, studentId);
create unique index if not exists content_favorite_students_uid on content_favorite_students (uid);


create table if not exists content_memos (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  contentId text not null,
  body text not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create unique index if not exists content_memos_userId_contentId on content_memos (userId, contentId);
create unique index if not exists content_memos_uid on content_memos (uid);
