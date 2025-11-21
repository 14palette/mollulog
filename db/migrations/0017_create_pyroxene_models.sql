create table pyroxene_owned_resources (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  eventUid text,
  inputAt text not null,
  pyroxene integer not null,
  oneTimeTicket integer not null,
  tenTimeTicket integer not null,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists pyroxene_owned_resources_uid on pyroxene_owned_resources (uid);
create index if not exists pyroxene_owned_resources_userId_inputAt on pyroxene_owned_resources (userId, inputAt);

create table pyroxene_timeline_items (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  eventAt text not null,
  source text not null,
  repeatIntervalDays integer,
  repeatCount integer,
  description text not null,
  pyroxeneDelta integer not null,
  oneTimeTicketDelta integer not null,
  tenTimeTicketDelta integer not null,
  createdAt text not null default current_timestamp,
  updatedAt text not null default current_timestamp
);

create unique index if not exists pyroxene_timeline_items_uid on pyroxene_timeline_items (uid);
create index if not exists pyroxene_timeline_items_userId_eventAt on pyroxene_timeline_items (userId, eventAt);

