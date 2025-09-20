-- Create student grading system with 1:N relationship between gradings and tags
-- This migration creates both the student_gradings table and the student_grading_tags table

-- Create student_gradings table
create table student_gradings (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  studentUid text not null,
  comment text,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists student_gradings_uid on student_gradings (uid);
create unique index if not exists student_gradings_userId_studentUid on student_gradings (userId, studentUid);
create index if not exists student_gradings_studentUid on student_gradings (studentUid);

-- Create student_grading_tags table for 1:N relationship with student_gradings
-- Includes denormalized studentUid for efficient aggregation
create table student_grading_tags (
  id integer primary key autoincrement,
  uid text not null,
  gradingUid text not null,
  studentUid text not null, -- Denormalized for efficient aggregation
  tagValue text not null,
  createdAt text not null default current_timestamp
);

create unique index if not exists student_grading_tags_uid on student_grading_tags (uid);
create index if not exists student_grading_tags_gradingUid on student_grading_tags (gradingUid);
create index if not exists student_grading_tags_studentUid on student_grading_tags (studentUid);
create index if not exists student_grading_tags_tagValue on student_grading_tags (tagValue);
