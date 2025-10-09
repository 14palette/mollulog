/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** An ISO 8601-encoded datetime */
  ISO8601DateTime: { input: Date; output: Date; }
};

export enum Attack {
  Explosive = 'explosive',
  Mystic = 'mystic',
  Piercing = 'piercing',
  Sonic = 'sonic'
}

export type ContentInterface = {
  confirmed: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  since: Scalars['ISO8601DateTime']['output'];
  uid: Scalars['String']['output'];
  until: Scalars['ISO8601DateTime']['output'];
};

/** The connection type for ContentInterface. */
export type ContentInterfaceConnection = {
  __typename?: 'ContentInterfaceConnection';
  /** A list of edges. */
  edges: Array<ContentInterfaceEdge>;
  /** A list of nodes. */
  nodes: Array<ContentInterface>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ContentInterfaceEdge = {
  __typename?: 'ContentInterfaceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Maybe<ContentInterface>;
};

export enum Defense {
  Elastic = 'elastic',
  Heavy = 'heavy',
  Light = 'light',
  Special = 'special'
}

export type DefenseTypeAndDifficulty = {
  __typename?: 'DefenseTypeAndDifficulty';
  defenseType: Defense;
  difficulty: Maybe<Difficulty>;
};

export enum Difficulty {
  Extreme = 'extreme',
  Hard = 'hard',
  Hardcore = 'hardcore',
  Insane = 'insane',
  Lunatic = 'lunatic',
  Normal = 'normal',
  Torment = 'torment',
  VeryHard = 'very_hard'
}

export type Event = ContentInterface & Node & {
  __typename?: 'Event';
  confirmed: Scalars['Boolean']['output'];
  endless: Scalars['Boolean']['output'];
  /** ID of the object. */
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pickups: Array<Pickup>;
  rerun: Scalars['Boolean']['output'];
  since: Scalars['ISO8601DateTime']['output'];
  stages: Array<Stage>;
  type: EventTypeEnum;
  uid: Scalars['String']['output'];
  until: Scalars['ISO8601DateTime']['output'];
  videos: Array<Video>;
};

/** The connection type for Event. */
export type EventConnection = {
  __typename?: 'EventConnection';
  /** A list of edges. */
  edges: Array<EventEdge>;
  /** A list of nodes. */
  nodes: Array<Event>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type EventEdge = {
  __typename?: 'EventEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Maybe<Event>;
};

export enum EventTypeEnum {
  ArchivePickup = 'archive_pickup',
  Campaign = 'campaign',
  Collab = 'collab',
  Event = 'event',
  Exercise = 'exercise',
  Fes = 'fes',
  GuideMission = 'guide_mission',
  ImmortalEvent = 'immortal_event',
  MainStory = 'main_story',
  MiniEvent = 'mini_event',
  Pickup = 'pickup'
}

export type Item = {
  __typename?: 'Item';
  category: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rarity: Scalars['Int']['output'];
  subCategory: Maybe<Scalars['String']['output']>;
  uid: Scalars['String']['output'];
};

/** An object with an ID. */
export type Node = {
  /** ID of the object. */
  id: Scalars['ID']['output'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor: Maybe<Scalars['String']['output']>;
};

export type Pickup = {
  __typename?: 'Pickup';
  event: Event;
  rerun: Scalars['Boolean']['output'];
  since: Scalars['ISO8601DateTime']['output'];
  student: Maybe<Student>;
  studentName: Scalars['String']['output'];
  type: PickupTypeEnum;
  until: Maybe<Scalars['ISO8601DateTime']['output']>;
};

export enum PickupTypeEnum {
  Archive = 'archive',
  Fes = 'fes',
  Given = 'given',
  Limited = 'limited',
  Usual = 'usual'
}

export type Query = {
  __typename?: 'Query';
  contents: ContentInterfaceConnection;
  event: Maybe<Event>;
  events: EventConnection;
  raid: Maybe<Raid>;
  raids: RaidConnection;
  student: Student;
  students: Array<Student>;
};


export type QueryContentsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  contentIds: InputMaybe<Array<Scalars['String']['input']>>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  sinceBefore: InputMaybe<Scalars['ISO8601DateTime']['input']>;
  untilAfter: InputMaybe<Scalars['ISO8601DateTime']['input']>;
};


export type QueryEventArgs = {
  uid: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  sinceBefore: InputMaybe<Scalars['ISO8601DateTime']['input']>;
  uids: InputMaybe<Array<Scalars['String']['input']>>;
  untilAfter: InputMaybe<Scalars['ISO8601DateTime']['input']>;
};


export type QueryRaidArgs = {
  uid: Scalars['String']['input'];
};


export type QueryRaidsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  sinceBefore: InputMaybe<Scalars['ISO8601DateTime']['input']>;
  types: InputMaybe<Array<RaidTypeEnum>>;
  uids: InputMaybe<Array<Scalars['String']['input']>>;
  untilAfter: InputMaybe<Scalars['ISO8601DateTime']['input']>;
};


export type QueryStudentArgs = {
  uid: Scalars['String']['input'];
};


export type QueryStudentsArgs = {
  uids: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Raid = ContentInterface & Node & {
  __typename?: 'Raid';
  attackType: Attack;
  boss: Scalars['String']['output'];
  confirmed: Scalars['Boolean']['output'];
  /** @deprecated Use defense_types instead */
  defenseType: Defense;
  defenseTypes: Array<DefenseTypeAndDifficulty>;
  /** ID of the object. */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rankVisible: Scalars['Boolean']['output'];
  ranks: Array<RaidRank>;
  since: Scalars['ISO8601DateTime']['output'];
  statistics: Array<RaidStatistics>;
  terrain: TerrainEnum;
  type: RaidTypeEnum;
  uid: Scalars['String']['output'];
  until: Scalars['ISO8601DateTime']['output'];
  videos: RaidVideoConnection;
};


export type RaidRanksArgs = {
  defenseType: InputMaybe<Defense>;
  excludeStudents: InputMaybe<Array<RaidRankFilter>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includeStudents: InputMaybe<Array<RaidRankFilter>>;
  rankAfter: InputMaybe<Scalars['Int']['input']>;
  rankBefore: InputMaybe<Scalars['Int']['input']>;
};


export type RaidStatisticsArgs = {
  defenseType: InputMaybe<Defense>;
};


export type RaidVideosArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<VideoSortEnum>;
};

/** The connection type for Raid. */
export type RaidConnection = {
  __typename?: 'RaidConnection';
  /** A list of edges. */
  edges: Array<RaidEdge>;
  /** A list of nodes. */
  nodes: Array<Raid>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type RaidEdge = {
  __typename?: 'RaidEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Maybe<Raid>;
};

export type RaidRank = Node & {
  __typename?: 'RaidRank';
  /** ID of the object. */
  id: Scalars['ID']['output'];
  parties: Array<RaidRankParty>;
  rank: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  video: Maybe<RaidVideo>;
};

export type RaidRankFilter = {
  tiers: InputMaybe<Array<Scalars['Int']['input']>>;
  uid: Scalars['String']['input'];
};

export type RaidRankParty = {
  __typename?: 'RaidRankParty';
  partyIndex: Scalars['Int']['output'];
  slots: Array<RaidRankPartySlot>;
};

export type RaidRankPartySlot = {
  __typename?: 'RaidRankPartySlot';
  isAssist: Maybe<Scalars['Boolean']['output']>;
  level: Maybe<Scalars['Int']['output']>;
  slotIndex: Scalars['Int']['output'];
  student: Maybe<Student>;
  tier: Maybe<Scalars['Int']['output']>;
};

export type RaidStatistics = Node & {
  __typename?: 'RaidStatistics';
  assistsByTier: Array<TierAndCount>;
  assistsCount: Scalars['Int']['output'];
  defenseType: Defense;
  difficulty: Difficulty;
  /** ID of the object. */
  id: Scalars['ID']['output'];
  raid: Raid;
  slotsByTier: Array<TierAndCount>;
  slotsCount: Scalars['Int']['output'];
  student: Student;
};

export enum RaidTypeEnum {
  Elimination = 'elimination',
  TotalAssault = 'total_assault',
  Unlimit = 'unlimit'
}

export type RaidVideo = Node & {
  __typename?: 'RaidVideo';
  /** ID of the object. */
  id: Scalars['ID']['output'];
  publishedAt: Scalars['ISO8601DateTime']['output'];
  score: Scalars['Int']['output'];
  thumbnailUrl: Scalars['String']['output'];
  title: Scalars['String']['output'];
  youtubeId: Scalars['String']['output'];
};

/** The connection type for RaidVideo. */
export type RaidVideoConnection = {
  __typename?: 'RaidVideoConnection';
  /** A list of edges. */
  edges: Array<RaidVideoEdge>;
  /** A list of nodes. */
  nodes: Array<RaidVideo>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type RaidVideoEdge = {
  __typename?: 'RaidVideoEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Maybe<RaidVideo>;
};

export enum RoleEnum {
  Special = 'special',
  Striker = 'striker'
}

export type SkillItem = {
  __typename?: 'SkillItem';
  amount: Scalars['Int']['output'];
  item: Item;
  skillLevel: Scalars['Int']['output'];
  skillType: SkillTypeEnum;
  student: Student;
};

export enum SkillTypeEnum {
  Ex = 'ex',
  Normal = 'normal'
}

export type Stage = {
  __typename?: 'Stage';
  difficulty: Scalars['Int']['output'];
  entryAp: Maybe<Scalars['Int']['output']>;
  index: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rewards: Array<StageReward>;
};

export type StageItem = {
  __typename?: 'StageItem';
  eventBonuses: Array<StageItemEventBonus>;
  imageId: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type StageItemEventBonus = {
  __typename?: 'StageItemEventBonus';
  ratio: Scalars['Float']['output'];
  student: Student;
};

export type StageReward = {
  __typename?: 'StageReward';
  amount: Scalars['Float']['output'];
  item: StageItem;
};

export type Student = {
  __typename?: 'Student';
  attackType: Attack;
  defenseType: Defense;
  equipments: Array<Scalars['String']['output']>;
  initialTier: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  pickups: Array<Pickup>;
  raidStatistics: Array<RaidStatistics>;
  released: Scalars['Boolean']['output'];
  role: RoleEnum;
  schaleDbId: Maybe<Scalars['String']['output']>;
  school: Scalars['String']['output'];
  skillItems: Array<SkillItem>;
  uid: Scalars['String']['output'];
};


export type StudentRaidStatisticsArgs = {
  raidSince: InputMaybe<Scalars['ISO8601DateTime']['input']>;
};


export type StudentSkillItemsArgs = {
  skillLevel: InputMaybe<Scalars['Int']['input']>;
  skillType: InputMaybe<SkillTypeEnum>;
};

export enum TerrainEnum {
  Indoor = 'indoor',
  Outdoor = 'outdoor',
  Street = 'street'
}

export type TierAndCount = {
  __typename?: 'TierAndCount';
  count: Scalars['Int']['output'];
  tier: Scalars['Int']['output'];
};

export type Video = {
  __typename?: 'Video';
  start: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  youtube: Scalars['String']['output'];
};

export enum VideoSortEnum {
  PublishedAtDesc = 'PUBLISHED_AT_DESC',
  ScoreDesc = 'SCORE_DESC'
}

export type AllStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllStudentsQuery = { __typename?: 'Query', students: Array<{ __typename?: 'Student', uid: string, name: string, school: string, initialTier: number, order: number, attackType: Attack, defenseType: Defense, role: RoleEnum, equipments: Array<string>, released: boolean }> };

export type UserFuturesQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type UserFuturesQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename?: 'Event', uid: string, name: string, since: Date, until: Date, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, student: { __typename?: 'Student', uid: string, attackType: Attack, defenseType: Defense, role: RoleEnum, schaleDbId: string | null, name: string, school: string, equipments: Array<string>, skillItems: Array<{ __typename?: 'SkillItem', item: { __typename?: 'Item', uid: string, subCategory: string | null, rarity: number } }> } | null }> }> } };

export type RaidForPartyQueryVariables = Exact<{ [key: string]: never; }>;


export type RaidForPartyQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', uid: string, name: string, type: RaidTypeEnum, boss: string, terrain: TerrainEnum, since: Date }> } };

export type RaidForPartyEditQueryVariables = Exact<{ [key: string]: never; }>;


export type RaidForPartyEditQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', uid: string, name: string, type: RaidTypeEnum, boss: string, terrain: TerrainEnum, since: Date, until: Date }> } };

export type UserPickupEventsQueryVariables = Exact<{
  eventUids: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type UserPickupEventsQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename?: 'Event', uid: string, name: string, type: EventTypeEnum, since: Date, pickups: Array<{ __typename?: 'Pickup', student: { __typename?: 'Student', uid: string } | null }> }> } };

export type PickupEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type PickupEventsQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename?: 'Event', uid: string, name: string, since: Date, until: Date, type: EventTypeEnum, rerun: boolean, pickups: Array<{ __typename?: 'Pickup', studentName: string, student: { __typename?: 'Student', uid: string } | null }> }> } };

export type SitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type SitemapQuery = { __typename?: 'Query', contents: { __typename?: 'ContentInterfaceConnection', nodes: Array<{ __typename: 'Event', uid: string, until: Date } | { __typename: 'Raid', uid: string, until: Date }> }, students: Array<{ __typename?: 'Student', uid: string }> };

export type IndexQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type IndexQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename: 'Event', name: string, since: Date, until: Date, endless: boolean, uid: string, type: EventTypeEnum, rerun: boolean, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, since: Date, until: Date | null, student: { __typename?: 'Student', uid: string, name: string, attackType: Attack, defenseType: Defense, role: RoleEnum, schaleDbId: string | null } | null }> }> }, raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', name: string, since: Date, until: Date, uid: string, type: RaidTypeEnum, boss: string, attackType: Attack, terrain: TerrainEnum, defenseTypes: Array<{ __typename?: 'DefenseTypeAndDifficulty', defenseType: Defense, difficulty: Difficulty | null }> }> } };

export type EventDetailQueryVariables = Exact<{
  eventUid: Scalars['String']['input'];
}>;


export type EventDetailQuery = { __typename?: 'Query', event: { __typename?: 'Event', uid: string, name: string, type: EventTypeEnum, since: Date, until: Date, endless: boolean, imageUrl: string | null, videos: Array<{ __typename?: 'Video', title: string, youtube: string, start: number | null }>, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, since: Date, until: Date | null, studentName: string, student: { __typename?: 'Student', uid: string, attackType: Attack, defenseType: Defense, role: RoleEnum } | null }> } | null };

export type EventStagesQueryVariables = Exact<{
  eventUid: Scalars['String']['input'];
}>;


export type EventStagesQuery = { __typename?: 'Query', event: { __typename?: 'Event', stages: Array<{ __typename?: 'Stage', difficulty: number, index: string, entryAp: number | null, rewards: Array<{ __typename?: 'StageReward', amount: number, item: { __typename?: 'StageItem', itemId: string, name: string, imageId: string, eventBonuses: Array<{ __typename?: 'StageItemEventBonus', ratio: number, student: { __typename?: 'Student', uid: string, role: RoleEnum } }> } }> }> } | null };

export type FutureContentsQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type FutureContentsQuery = { __typename?: 'Query', contents: { __typename?: 'ContentInterfaceConnection', nodes: Array<{ __typename: 'Event', rerun: boolean, endless: boolean, uid: string, name: string, since: Date, until: Date, confirmed: boolean, eventType: EventTypeEnum, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, since: Date, until: Date | null, studentName: string, student: { __typename?: 'Student', uid: string, attackType: Attack, defenseType: Defense, role: RoleEnum, schaleDbId: string | null } | null }> } | { __typename: 'Raid', rankVisible: boolean, boss: string, terrain: TerrainEnum, attackType: Attack, uid: string, name: string, since: Date, until: Date, confirmed: boolean, raidType: RaidTypeEnum, defenseTypes: Array<{ __typename?: 'DefenseTypeAndDifficulty', defenseType: Defense, difficulty: Difficulty | null }> }> } };

export type AllRaidQueryVariables = Exact<{ [key: string]: never; }>;


export type AllRaidQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', uid: string, type: RaidTypeEnum, name: string, boss: string, since: Date, until: Date, terrain: TerrainEnum, attackType: Attack, rankVisible: boolean, defenseTypes: Array<{ __typename?: 'DefenseTypeAndDifficulty', defenseType: Defense, difficulty: Difficulty | null }> }> } };

export type RaidDetailQueryVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type RaidDetailQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', uid: string, type: RaidTypeEnum, name: string, boss: string, since: Date, until: Date, terrain: TerrainEnum, attackType: Attack, rankVisible: boolean, defenseTypes: Array<{ __typename?: 'DefenseTypeAndDifficulty', defenseType: Defense, difficulty: Difficulty | null }>, videos: { __typename?: 'RaidVideoConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean } }, statistics: Array<{ __typename?: 'RaidStatistics', student: { __typename?: 'Student', uid: string, name: string }, slotsByTier: Array<{ __typename?: 'TierAndCount', tier: number }>, assistsByTier: Array<{ __typename?: 'TierAndCount', tier: number }> }> } | null };

export type LatestRaidQueryVariables = Exact<{
  untilAfter: Scalars['ISO8601DateTime']['input'];
}>;


export type LatestRaidQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', uid: string, type: RaidTypeEnum, name: string, boss: string, since: Date, until: Date, terrain: TerrainEnum, attackType: Attack, rankVisible: boolean }> } };

export type RaidRanksQueryVariables = Exact<{
  defenseType: InputMaybe<Defense>;
  raidUid: Scalars['String']['input'];
  includeStudents: InputMaybe<Array<RaidRankFilter> | RaidRankFilter>;
  excludeStudents: InputMaybe<Array<RaidRankFilter> | RaidRankFilter>;
  rankAfter: InputMaybe<Scalars['Int']['input']>;
  rankBefore: InputMaybe<Scalars['Int']['input']>;
}>;


export type RaidRanksQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', rankVisible: boolean, ranks: Array<{ __typename?: 'RaidRank', rank: number, score: number, parties: Array<{ __typename?: 'RaidRankParty', partyIndex: number, slots: Array<{ __typename?: 'RaidRankPartySlot', slotIndex: number, tier: number | null, level: number | null, isAssist: boolean | null, student: { __typename?: 'Student', uid: string, name: string } | null }> }>, video: { __typename?: 'RaidVideo', youtubeId: string } | null }> } | null };

export type RaidStatisticsQueryVariables = Exact<{
  uid: Scalars['String']['input'];
  defenseType: Defense;
}>;


export type RaidStatisticsQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', statistics: Array<{ __typename?: 'RaidStatistics', slotsCount: number, assistsCount: number, student: { __typename?: 'Student', uid: string, name: string, role: RoleEnum }, slotsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }>, assistsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }> }> } | null };

export type RaidVideosQueryVariables = Exact<{
  uid: Scalars['String']['input'];
  first: InputMaybe<Scalars['Int']['input']>;
  after: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<VideoSortEnum>;
}>;


export type RaidVideosQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', videos: { __typename?: 'RaidVideoConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor: string | null, endCursor: string | null }, edges: Array<{ __typename?: 'RaidVideoEdge', node: { __typename?: 'RaidVideo', id: string, title: string, score: number, youtubeId: string, thumbnailUrl: string, publishedAt: Date } | null }> } } | null };

export type StudentDetailQueryVariables = Exact<{
  uid: Scalars['String']['input'];
  raidSince: Scalars['ISO8601DateTime']['input'];
}>;


export type StudentDetailQuery = { __typename?: 'Query', student: { __typename?: 'Student', name: string, uid: string, attackType: Attack, defenseType: Defense, role: RoleEnum, school: string, schaleDbId: string | null, pickups: Array<{ __typename?: 'Pickup', since: Date, until: Date | null, event: { __typename?: 'Event', type: EventTypeEnum, uid: string, name: string, rerun: boolean, imageUrl: string | null } }>, raidStatistics: Array<{ __typename?: 'RaidStatistics', difficulty: Difficulty, defenseType: Defense, slotsCount: number, assistsCount: number, raid: { __typename?: 'Raid', uid: string, name: string, boss: string, type: RaidTypeEnum, since: Date, until: Date, terrain: TerrainEnum }, slotsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }>, assistsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }> }> } };

export type StudentGradeDetailQueryVariables = Exact<{
  uid: Scalars['String']['input'];
}>;


export type StudentGradeDetailQuery = { __typename?: 'Query', student: { __typename?: 'Student', name: string, uid: string, attackType: Attack, defenseType: Defense, role: RoleEnum, school: string, schaleDbId: string | null } };


export const AllStudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllStudents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"initialTier"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"equipments"}},{"kind":"Field","name":{"kind":"Name","value":"released"}}]}}]}}]} as unknown as DocumentNode<AllStudentsQuery, AllStudentsQueryVariables>;
export const UserFuturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserFutures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"999"}},{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"equipments"}},{"kind":"Field","name":{"kind":"Name","value":"skillItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"skillType"},"value":{"kind":"EnumValue","value":"ex"}},{"kind":"Argument","name":{"kind":"Name","value":"skillLevel"},"value":{"kind":"IntValue","value":"5"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"subCategory"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UserFuturesQuery, UserFuturesQueryVariables>;
export const RaidForPartyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidForParty"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"since"}}]}}]}}]}}]} as unknown as DocumentNode<RaidForPartyQuery, RaidForPartyQueryVariables>;
export const RaidForPartyEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidForPartyEdit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}}]}}]}}]} as unknown as DocumentNode<RaidForPartyEditQuery, RaidForPartyEditQueryVariables>;
export const UserPickupEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserPickupEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventUids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventUids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UserPickupEventsQuery, UserPickupEventsQueryVariables>;
export const PickupEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PickupEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"9999"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PickupEventsQuery, PickupEventsQueryVariables>;
export const SitemapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sitemap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}}]}}]}}]} as unknown as DocumentNode<SitemapQuery, SitemapQueryVariables>;
export const IndexDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Index"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"sinceBefore"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"endless"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"raids"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"total_assault"},{"kind":"EnumValue","value":"elimination"}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"2"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"defenseTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}}]}}]}}]}}]}}]} as unknown as DocumentNode<IndexQuery, IndexQueryVariables>;
export const EventDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventUid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"endless"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"youtube"}},{"kind":"Field","name":{"kind":"Name","value":"start"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}}]}}]} as unknown as DocumentNode<EventDetailQuery, EventDetailQueryVariables>;
export const EventStagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventStages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventUid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"entryAp"}},{"kind":"Field","name":{"kind":"Name","value":"rewards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageId"}},{"kind":"Field","name":{"kind":"Name","value":"eventBonuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ratio"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EventStagesQuery, EventStagesQueryVariables>;
export const FutureContentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FutureContents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"9999"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"eventType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"endless"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Raid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"raidType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<FutureContentsQuery, FutureContentsQueryVariables>;
export const AllRaidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllRaid"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}},{"kind":"Field","name":{"kind":"Name","value":"defenseTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AllRaidQuery, AllRaidQueryVariables>;
export const RaidDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}},{"kind":"Field","name":{"kind":"Name","value":"defenseTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statistics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"slotsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RaidDetailQuery, RaidDetailQueryVariables>;
export const LatestRaidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LatestRaid"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"untilAfter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"total_assault"},{"kind":"EnumValue","value":"elimination"}]}},{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"untilAfter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}}]}}]}}]}}]} as unknown as DocumentNode<LatestRaidQuery, LatestRaidQueryVariables>;
export const RaidRanksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidRanks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Defense"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"raidUid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeStudents"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RaidRankFilter"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"excludeStudents"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RaidRankFilter"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rankAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rankBefore"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"raidUid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}},{"kind":"Field","name":{"kind":"Name","value":"ranks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"defenseType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"11"}},{"kind":"Argument","name":{"kind":"Name","value":"rankAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rankAfter"}}},{"kind":"Argument","name":{"kind":"Name","value":"rankBefore"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rankBefore"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeStudents"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeStudents"}}},{"kind":"Argument","name":{"kind":"Name","value":"excludeStudents"},"value":{"kind":"Variable","name":{"kind":"Name","value":"excludeStudents"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"parties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"partyIndex"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slotIndex"}},{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"isAssist"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"video"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"youtubeId"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RaidRanksQuery, RaidRanksQueryVariables>;
export const RaidStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Defense"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"defenseType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"slotsCount"}},{"kind":"Field","name":{"kind":"Name","value":"slotsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistsCount"}},{"kind":"Field","name":{"kind":"Name","value":"assistsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RaidStatisticsQuery, RaidStatisticsQueryVariables>;
export const RaidVideosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidVideos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VideoSortEnum"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"youtubeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<RaidVideosQuery, RaidVideosQueryVariables>;
export const StudentDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"raidSince"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"raidStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"raidSince"},"value":{"kind":"Variable","name":{"kind":"Name","value":"raidSince"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}}]}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"slotsCount"}},{"kind":"Field","name":{"kind":"Name","value":"slotsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistsCount"}},{"kind":"Field","name":{"kind":"Name","value":"assistsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StudentDetailQuery, StudentDetailQueryVariables>;
export const StudentGradeDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentGradeDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"uid"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"uid"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}}]}}]}}]} as unknown as DocumentNode<StudentGradeDetailQuery, StudentGradeDetailQueryVariables>;