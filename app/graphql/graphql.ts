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

export type Event = ContentInterface & Node & {
  __typename?: 'Event';
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
  students: Array<Student>;
};


export type QueryContentsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
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
  untilAfter: InputMaybe<Scalars['ISO8601DateTime']['input']>;
};


export type QueryStudentsArgs = {
  studentIds: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Raid = ContentInterface & Node & {
  __typename?: 'Raid';
  attackType: Attack;
  boss: Scalars['String']['output'];
  defenseType: Defense;
  /** ID of the object. */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  raidId: Scalars['String']['output'];
  since: Scalars['ISO8601DateTime']['output'];
  terrain: TerrainEnum;
  type: RaidTypeEnum;
  until: Scalars['ISO8601DateTime']['output'];
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
  released: Scalars['Boolean']['output'];
  role: RoleEnum;
  school: Scalars['String']['output'];
  studentId: Scalars['String']['output'];
};

export enum TerrainEnum {
  Indoor = 'indoor',
  Outdoor = 'outdoor',
  Street = 'street'
}

export type Video = {
  __typename?: 'Video';
  start: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  youtube: Scalars['String']['output'];
};

export type AllStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllStudentsQuery = { __typename?: 'Query', students: Array<{ __typename?: 'Student', name: string, school: string, initialTier: number, order: number, attackType: Attack, defenseType: Defense, role: RoleEnum, equipments: Array<string>, released: boolean, id: string }> };

export type RaidForPartyQueryVariables = Exact<{ [key: string]: never; }>;


export type RaidForPartyQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', raidId: string, name: string, type: RaidTypeEnum, boss: string, terrain: TerrainEnum, since: Date }> } };

export type SitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type SitemapQuery = { __typename?: 'Query', contents: { __typename?: 'ContentInterfaceConnection', nodes: Array<{ __typename: 'Event', until: Date, id: string } | { __typename: 'Raid', until: Date, id: string }> } };

export type IndexQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type IndexQuery = { __typename?: 'Query', contents: { __typename?: 'ContentInterfaceConnection', nodes: Array<{ __typename: 'Event', eventId: string, rerun: boolean, name: string, since: Date, until: Date, eventType: EventTypeEnum, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, studentName: string, student: { __typename?: 'Student', studentId: string } | null }> } | { __typename: 'Raid', raidId: string, boss: string, terrain: TerrainEnum, attackType: Attack, defenseType: Defense, name: string, since: Date, until: Date, raidType: RaidTypeEnum }> } };

export type RaidForPartyEditQueryVariables = Exact<{ [key: string]: never; }>;


export type RaidForPartyEditQuery = { __typename?: 'Query', raids: { __typename?: 'RaidConnection', nodes: Array<{ __typename?: 'Raid', raidId: string, name: string, type: RaidTypeEnum, boss: string, terrain: TerrainEnum, since: Date, until: Date }> } };

export type ProfileStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileStudentsQuery = { __typename?: 'Query', students: Array<{ __typename?: 'Student', studentId: string, name: string }> };

export type EventDetailQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type EventDetailQuery = { __typename?: 'Query', event: { __typename?: 'Event', name: string, type: EventTypeEnum, since: Date, until: Date, imageUrl: string | null, videos: Array<{ __typename?: 'Video', title: string, youtube: string, start: number | null }>, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, studentName: string, student: { __typename?: 'Student', studentId: string } | null }> } | null };

export type EventStagesQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type EventStagesQuery = { __typename?: 'Query', event: { __typename?: 'Event', stages: Array<{ __typename?: 'Stage', difficulty: number, index: string, entryAp: number | null, rewards: Array<{ __typename?: 'StageReward', amount: number, item: { __typename?: 'Item', itemId: string, name: string, imageId: string, eventBonuses: Array<{ __typename?: 'ItemEventBonus', studentId: string, ratio: number }> } }> }> } | null };

export type FutureContentsQueryVariables = Exact<{
  now: Scalars['ISO8601DateTime']['input'];
}>;


export type FutureContentsQuery = { __typename?: 'Query', contents: { __typename?: 'ContentInterfaceConnection', nodes: Array<{ __typename: 'Event', eventId: string, rerun: boolean, name: string, since: Date, until: Date, eventType: EventTypeEnum, pickups: Array<{ __typename?: 'Pickup', type: PickupTypeEnum, rerun: boolean, studentName: string, student: { __typename?: 'Student', studentId: string } | null }> } | { __typename: 'Raid', raidId: string, boss: string, terrain: TerrainEnum, attackType: Attack, defenseType: Defense, name: string, since: Date, until: Date, raidType: RaidTypeEnum }> } };

export type RaidDetailQueryVariables = Exact<{
  raidId: Scalars['String']['input'];
  studentIds: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type RaidDetailQuery = { __typename?: 'Query', raid: { __typename?: 'Raid', raidId: string, type: RaidTypeEnum, name: string, boss: string, since: Date, until: Date, terrain: TerrainEnum, attackType: Attack, defenseType: Defense } | null, students: Array<{ __typename?: 'Student', studentId: string, name: string, initialTier: number }> };


export const AllStudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllStudents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"id"},"name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"school"}},{"kind":"Field","name":{"kind":"Name","value":"initialTier"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"equipments"}},{"kind":"Field","name":{"kind":"Name","value":"released"}}]}}]}}]} as unknown as DocumentNode<AllStudentsQuery, AllStudentsQueryVariables>;
export const RaidForPartyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidForParty"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"since"}}]}}]}}]}}]} as unknown as DocumentNode<RaidForPartyQuery, RaidForPartyQueryVariables>;
export const SitemapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sitemap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"id"},"name":{"kind":"Name","value":"eventId"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Raid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"id"},"name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SitemapQuery, SitemapQueryVariables>;
export const IndexDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Index"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"sinceBefore"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"9999"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","alias":{"kind":"Name","value":"eventType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Raid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","alias":{"kind":"Name","value":"raidType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}}]}}]}}]}}]}}]} as unknown as DocumentNode<IndexQuery, IndexQueryVariables>;
export const RaidForPartyEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidForPartyEdit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}}]}}]}}]}}]} as unknown as DocumentNode<RaidForPartyEditQuery, RaidForPartyEditQueryVariables>;
export const ProfileStudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProfileStudents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ProfileStudentsQuery, ProfileStudentsQueryVariables>;
export const EventDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"youtube"}},{"kind":"Field","name":{"kind":"Name","value":"start"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}}]}}]} as unknown as DocumentNode<EventDetailQuery, EventDetailQueryVariables>;
export const EventStagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventStages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"eventId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"eventId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"entryAp"}},{"kind":"Field","name":{"kind":"Name","value":"rewards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageId"}},{"kind":"Field","name":{"kind":"Name","value":"eventBonuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"ratio"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EventStagesQuery, EventStagesQueryVariables>;
export const FutureContentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FutureContents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"now"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ISO8601DateTime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"untilAfter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"now"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"9999"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventId"}},{"kind":"Field","alias":{"kind":"Name","value":"eventType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"pickups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"rerun"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"studentName"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Raid"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","alias":{"kind":"Name","value":"raidType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FutureContentsQuery, FutureContentsQueryVariables>;
export const RaidDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RaidDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"studentIds"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"raidId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"raidId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"raidId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"since"}},{"kind":"Field","name":{"kind":"Name","value":"until"}},{"kind":"Field","name":{"kind":"Name","value":"terrain"}},{"kind":"Field","name":{"kind":"Name","value":"attackType"}},{"kind":"Field","name":{"kind":"Name","value":"defenseType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"studentIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"studentIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"initialTier"}}]}}]}}]} as unknown as DocumentNode<RaidDetailQuery, RaidDetailQueryVariables>;