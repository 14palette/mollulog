create table user_relationship_levels (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  studentId text not null,
  currentLevel integer not null,
  targetLevel integer not null,
  items text not null, -- JSON field for itemId and quantity
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists user_relationship_levels_uid on user_relationship_levels (uid);
create unique index if not exists user_relationship_levels_userId_studentId on user_relationship_levels (userId, studentId);
