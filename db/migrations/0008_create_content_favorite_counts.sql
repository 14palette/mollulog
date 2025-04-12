create table content_favorite_counts (
  id integer primary key autoincrement,
  studentId text not null,
  contentId text not null,
  count integer not null default 0,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists content_favorite_counts_studentId_contentId on content_favorite_counts (studentId, contentId);
