create table event_shop_states (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  eventUid text not null,
  itemQuantities text not null default '{}', -- JSON field for resourceUid -> quantity
  selectedBonusStudentUids text not null default '[]', -- JSON array of student UIDs
  enabledStages text not null default '{}', -- JSON field for stageUid -> enabled boolean
  includeRecruitedStudents integer not null default 0, -- boolean (0 or 1)
  existingPaymentItemQuantities text not null default '{}', -- JSON field for paymentResourceUid -> quantity
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists event_shop_states_uid on event_shop_states (uid);
create unique index if not exists event_shop_states_userId_eventUid on event_shop_states (userId, eventUid);

