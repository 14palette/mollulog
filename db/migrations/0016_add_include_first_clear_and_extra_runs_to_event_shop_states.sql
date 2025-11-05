alter table event_shop_states add column includeFirstClear integer not null default 0; -- boolean (0 or 1)
alter table event_shop_states add column extraStageRuns text not null default '{}'; -- JSON field for stageUid -> extra runs count

