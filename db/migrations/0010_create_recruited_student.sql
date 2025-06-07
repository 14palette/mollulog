create table recruited_students (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  studentUid text not null,
  tier integer not null,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists recruited_students_uid on recruited_students (uid);
create unique index if not exists recruited_students_userId_studentUid on recruited_students (userId, studentUid);
