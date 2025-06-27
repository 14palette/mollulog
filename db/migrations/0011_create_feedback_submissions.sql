create table feedback_submissions (
  id integer primary key autoincrement,
  uid text not null,
  userId bigint not null,
  title text not null,
  content text not null,
  replyEmail text,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists feedback_submissions_uid on feedback_submissions (uid);
create index if not exists feedback_submissions_userId on feedback_submissions (userId);
