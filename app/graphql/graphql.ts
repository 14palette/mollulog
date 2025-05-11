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
  eventId: Scalars['String']['output'];
  /** ID of the object. */
  id: Scalars['ID']['output'];
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pickups: Array<Pickup>;
  rerun: Scalars['Boolean']['output'];
  since: Scalars['ISO8601DateTime']['output'];
  stages: Array<Stage>;
  type: EventTypeEnum;
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
  eventBonuses: Array<ItemEventBonus>;
  imageId: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type ItemEventBonus = {
  __typename?: 'ItemEventBonus';
  ratio: Scalars['Float']['output'];
  student: Student;
  studentId: Scalars['String']['output'];
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
  rerun: Scalars['Boolean']['output'];
  student: Maybe<Student>;
  studentName: Scalars['String']['output'];
  type: PickupTypeEnum;
};

export enum PickupTypeEnum {
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
  eventId: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  eventIds: InputMaybe<Array<Scalars['String']['input']>>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  sinceBefore: InputMaybe<Scalars['ISO8601DateTime']['input']>;
  untilAfter: InputMaybe<Scalars['ISO8601DateTime']['input']>;
};


export type QueryRaidArgs = {
  raidId: Scalars['String']['input'];
};


export type QueryRaidsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  raidIds: InputMaybe<Array<Scalars['String']['input']>>;
  sinceBefore: InputMaybe<Scalars['ISO8601DateTime']['input']>;
  types: InputMaybe<Array<RaidTypeEnum>>;
  untilAfter: InputMaybe<Scalars['ISO8601DateTime']['input']>;
};


export type QueryStudentArgs = {
  studentId: Scalars['String']['input'];
};


export type QueryStudentsArgs = {
  studentIds: InputMaybe<Array<Scalars['String']['input']>>;
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
  raidId: Scalars['String']['output'];
  rankVisible: Scalars['Boolean']['output'];
  ranks: Array<RaidRank>;
  since: Scalars['ISO8601DateTime']['output'];
  statistics: Array<RaidStatistics>;
  terrain: TerrainEnum;
  type: RaidTypeEnum;
  until: Scalars['ISO8601DateTime']['output'];
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
};

export type RaidRankFilter = {
  studentId: Scalars['String']['input'];
  tier: Scalars['Int']['input'];
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

export enum RoleEnum {
  Special = 'special',
  Striker = 'striker'
}

export type Stage = {
  __typename?: 'Stage';
  difficulty: Scalars['Int']['output'];
  entryAp: Maybe<Scalars['Int']['output']>;
  index: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rewards: Array<StageReward>;
};

export type StageReward = {
  __typename?: 'StageReward';
  amount: Scalars['Float']['output'];
  item: Item;
};

export type Student = {
  __typename?: 'Student';
  attackType: Attack;
  defenseType: Defense;
  equipments: Array<Scalars['String']['output']>;
  initialTier: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  raidStatistics: Array<RaidStatistics>;
  released: Scalars['Boolean']['output'];
  role: RoleEnum;
  schaleDbId: Scalars['String']['output'];
  school: Scalars['String']['output'];
  studentId: Scalars['String']['output'];
};


export type StudentRaidStatisticsArgs = {
  raidSince: InputMaybe<Scalars['ISO8601DateTime']['input']>;
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

export type AllStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllStudentsQuery = { __typename?: 'Query', students: Array<{ __typename?: 'Student', name: string, school: string, initialTier: number, order: number, attackType: Attack, defenseType: Defense, role: RoleEnum, equipments: Array<string>, released: boolean, id: string }> };

export type UserFuturesQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type UserFuturesQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename?: 'Event', eventId: string, name: string, since: Date, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, student: { __typename?: 'Student', studentId: string, schaleDbId: string, name: string, school: string, equipments: Array<string> } | null }> }> } };

export type RaidForPartyQueryVariables = Exact<{ [key: string]: never; }>;


export type RaidForPartyQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', raidId: string, name: string, type: RaidTypeEnum, boss: string, terrain: TerrainEnum, since: Date }> } };

export type UserPickupEventsQueryVariables = Exact<{
  eventIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type UserPickupEventsQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename?: 'Event', eventId: string, name: string, type: EventTypeEnum, since: Date, pickups: Array<{ __typename?: 'Pickup', student: { __typename?: 'Student', studentId: string } | null }> }> } };

export type SitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type SitemapQuery = { __typename?: 'Query', contents: { __typename?: 'ContentInterfaceConnection', nodes: Array<{ __typename: 'Event', until: Date, id: string } | { __typename: 'Raid', until: Date, id: string }> } };

export type IndexQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type IndexQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename?: 'Event', name: string, since: Date, until: Date, eventId: string, type: EventTypeEnum, rerun: boolean, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, student: { __typename?: 'Student', studentId: string, name: string, attackType: Attack, defenseType: Defense, role: RoleEnum, schaleDbId: string } | null }> }> }, raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', name: string, since: Date, until: Date, raidId: string, type: RaidTypeEnum, boss: string, attackType: Attack, defenseType: Defense, terrain: TerrainEnum }> } };

export type RaidForPartyEditQueryVariables = Exact<{ [key: string]: never; }>;


export type RaidForPartyEditQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', raidId: string, name: string, type: RaidTypeEnum, boss: string, terrain: TerrainEnum, since: Date, until: Date }> } };

export type PickupEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type PickupEventsQuery = { __typename?: 'Query', events: { __typename?: 'EventConnection', nodes: Array<{ __typename?: 'Event', eventId: string, name: string, since: Date, until: Date, type: EventTypeEnum, rerun: boolean, pickups: Array<{ __typename?: 'Pickup', studentName: string, student: { __typename?: 'Student', studentId: string } | null }> }> } };

export type ProfileStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileStudentsQuery = { __typename?: 'Query', students: Array<{ __typename?: 'Student', studentId: string, name: string }> };

export type EventDetailQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type EventDetailQuery = { __typename?: 'Query', event: { __typename?: 'Event', eventId: string, name: string, type: EventTypeEnum, since: Date, until: Date, imageUrl: string | null, videos: Array<{ __typename?: 'Video', title: string, youtube: string, start: number | null }>, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, studentName: string, student: { __typename?: 'Student', studentId: string, attackType: Attack, defenseType: Defense, role: RoleEnum } | null }> } | null };

export type EventStagesQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type EventStagesQuery = { __typename?: 'Query', event: { __typename?: 'Event', stages: Array<{ __typename?: 'Stage', difficulty: number, index: string, entryAp: number | null, rewards: Array<{ __typename?: 'StageReward', amount: number, item: { __typename?: 'Item', itemId: string, name: string, imageId: string, eventBonuses: Array<{ __typename?: 'ItemEventBonus', ratio: number, student: { __typename?: 'Student', studentId: string, role: RoleEnum } }> } }> }> } | null };

export type FutureContentsQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type FutureContentsQuery = { __typename?: 'Query', contents: { __typename?: 'ContentInterfaceConnection', nodes: Array<{ __typename?: 'Event', rerun: boolean, name: string, since: Date, until: Date, confirmed: boolean, contentId: string, eventType: EventTypeEnum, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, studentName: string, student: { __typename?: 'Student', studentId: string, attackType: Attack, defenseType: Defense, role: RoleEnum, schaleDbId: string } | null }> } | { __typename?: 'Raid', rankVisible: boolean, boss: string, terrain: TerrainEnum, attackType: Attack, defenseType: Defense, name: string, since: Date, until: Date, confirmed: boolean, contentId: string, raidType: RaidTypeEnum }> } };

export type RaidDetailQueryVariables = Exact<{
  raidId: Scalars['String']['input'];
}>;


export type RaidDetailQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', raidId: string, type: RaidTypeEnum, name: string, boss: string, since: Date, until: Date, terrain: TerrainEnum, attackType: Attack, rankVisible: boolean, defenseTypes: Array<{ __typename?: 'DefenseTypeAndDifficulty', defenseType: Defense, difficulty: Difficulty | null }> } | null };

export type RaidRanksQueryVariables = Exact<{
  defenseType: InputMaybe<Defense>;
  raidId: Scalars['String']['input'];
  includeStudents: InputMaybe<Array<RaidRankFilter> | RaidRankFilter>;
  excludeStudents: InputMaybe<Array<RaidRankFilter> | RaidRankFilter>;
  rankAfter: InputMaybe<Scalars['Int']['input']>;
  rankBefore: InputMaybe<Scalars['Int']['input']>;
}>;


export type RaidRanksQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', rankVisible: boolean, ranks: Array<{ __typename?: 'RaidRank', rank: number, score: number, parties: Array<{ __typename?: 'RaidRankParty', partyIndex: number, slots: Array<{ __typename?: 'RaidRankPartySlot', slotIndex: number, tier: number | null, student: { __typename?: 'Student', studentId: string, name: string } | null }> }> }> } | null };

export type RaidStatisticsQueryVariables = Exact<{
  raidId: Scalars['String']['input'];
  defenseType: Defense;
}>;


export type RaidStatisticsQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', statistics: Array<{ __typename?: 'RaidStatistics', slotsCount: number, assistsCount: number, student: { __typename?: 'Student', studentId: string, name: string, role: RoleEnum }, slotsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }>, assistsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }> }> } | null };

export type StudentDetailQueryVariables = Exact<{
  uid: Scalars['String']['input'];
  raidSince: Scalars['ISO8601DateTime']['input'];
}>;


export type StudentDetailQuery = { __typename?: 'Query', student: { __typename?: 'Student', name: string, studentId: string, attackType: Attack, defenseType: Defense, role: RoleEnum, school: string, schaleDbId: string, raidStatistics: Array<{ __typename?: 'RaidStatistics', defenseType: Defense, slotsCount: number, assistsCount: number, raid: { __typename?: 'Raid', raidId: string, name: string, boss: string, type: RaidTypeEnum, since: Date, until: Date }, slotsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }>, assistsByTier: Array<{ __typename?: 'TierAndCount', tier: number, count: number }> }> } };


export const AllStudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllStudents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"id"},"name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"initialTier"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"equipments"}},{"kind":"Field","name":{"kind":"Name","value":"released"}}]}}]}}]} as unknown as DocumentNode<AllStudentsQuery, AllStudentsQueryVariables>;
export const UserFuturesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserFutures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"999"}},{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"equipments"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UserFuturesQuery, UserFuturesQueryVariables>;
export const RaidForPartyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidForParty"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"since"}}]}}]}}]}}]} as unknown as DocumentNode<RaidForPartyQuery, RaidForPartyQueryVariables>;
export const UserPickupEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserPickupEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UserPickupEventsQuery, UserPickupEventsQueryVariables>;
export const SitemapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sitemap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"id"},"name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Raid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"id"},"name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SitemapQuery, SitemapQueryVariables>;
export const IndexDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Index"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"sinceBefore"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"raids"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"total_assault"},{"kind":"EnumValue","value":"elimination"}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"2"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}}]}}]}}]}}]} as unknown as DocumentNode<IndexQuery, IndexQueryVariables>;
export const RaidForPartyEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidForPartyEdit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}}]}}]}}]} as unknown as DocumentNode<RaidForPartyEditQuery, RaidForPartyEditQueryVariables>;
export const PickupEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PickupEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"9999"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PickupEventsQuery, PickupEventsQueryVariables>;
export const ProfileStudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProfileStudents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ProfileStudentsQuery, ProfileStudentsQueryVariables>;
export const EventDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"youtube"}},{"kind":"Field","name":{"kind":"Name","value":"start"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}}]}}]} as unknown as DocumentNode<EventDetailQuery, EventDetailQueryVariables>;
export const EventStagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventStages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"entryAp"}},{"kind":"Field","name":{"kind":"Name","value":"rewards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageId"}},{"kind":"Field","name":{"kind":"Name","value":"eventBonuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ratio"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EventStagesQuery, EventStagesQueryVariables>;
export const FutureContentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FutureContents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"9999"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"contentId"},"name":{"kind":"Name","value":"eventId"}},{"kind":"Field","alias":{"kind":"Name","value":"eventType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Raid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"contentId"},"name":{"kind":"Name","value":"raidId"}},{"kind":"Field","alias":{"kind":"Name","value":"raidType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FutureContentsQuery, FutureContentsQueryVariables>;
export const RaidDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"raidId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defenseTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}}]}},{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}}]}}]}}]} as unknown as DocumentNode<RaidDetailQuery, RaidDetailQueryVariables>;
export const RaidRanksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidRanks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Defense"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeStudents"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RaidRankFilter"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"excludeStudents"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RaidRankFilter"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rankAfter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rankBefore"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"raidId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rankVisible"}},{"kind":"Field","name":{"kind":"Name","value":"ranks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"defenseType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"11"}},{"kind":"Argument","name":{"kind":"Name","value":"rankAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rankAfter"}}},{"kind":"Argument","name":{"kind":"Name","value":"rankBefore"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rankBefore"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeStudents"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeStudents"}}},{"kind":"Argument","name":{"kind":"Name","value":"excludeStudents"},"value":{"kind":"Variable","name":{"kind":"Name","value":"excludeStudents"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"parties"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"partyIndex"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slotIndex"}},{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<RaidRanksQuery, RaidRanksQueryVariables>;
export const RaidStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Defense"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"raidId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"defenseType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"defenseType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"slotsCount"}},{"kind":"Field","name":{"kind":"Name","value":"slotsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistsCount"}},{"kind":"Field","name":{"kind":"Name","value":"assistsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RaidStatisticsQuery, RaidStatisticsQueryVariables>;
export const StudentDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"uid"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"raidSince"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"studentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"uid"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"schaleDbId"}},{"kind":"Field","name":{"kind":"Name","value":"raidStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"raidSince"},"value":{"kind":"Variable","name":{"kind":"Name","value":"raidSince"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"slotsCount"}},{"kind":"Field","name":{"kind":"Name","value":"slotsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistsCount"}},{"kind":"Field","name":{"kind":"Name","value":"assistsByTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tier"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StudentDetailQuery, StudentDetailQueryVariables>;