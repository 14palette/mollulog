/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query AllStudents {\n    students {\n      uid\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n": typeof types.AllStudentsDocument,
    "\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        uid name since\n        pickups {\n          type rerun\n          student { uid schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n": typeof types.UserFuturesDocument,
    "\n  query RaidForParty {\n    raids {\n      nodes { uid name type boss terrain since }\n    }\n  }\n": typeof types.RaidForPartyDocument,
    "\n  query RaidForPartyEdit {\n    raids {\n      nodes { uid name type boss terrain since until }\n    }\n  }\n": typeof types.RaidForPartyEditDocument,
    "\n  query UserPickupEvents($eventUids: [String!]!) {\n    events(uids: $eventUids) {\n      nodes {\n        uid name type since\n        pickups {\n          student { uid }\n        }\n      }\n    }\n  }\n": typeof types.UserPickupEventsDocument,
    "\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        uid name since until type rerun\n        pickups {\n          student { uid }\n          studentName\n        }\n      }\n    }\n  }\n": typeof types.PickupEventsDocument,
    "\n  query Sitemap {\n    contents {\n      nodes { __typename uid until }\n    }\n    students { uid }\n  }\n": typeof types.SitemapDocument,
    "\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        __typename name since until endless uid type rerun\n        pickups {\n          type rerun since until\n          student { uid name attackType defenseType role schaleDbId }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until uid type boss attackType defenseType terrain\n      }\n    }\n  }\n": typeof types.IndexDocument,
    "\n  query EventDetail($eventUid: String!) {\n    event(uid: $eventUid) {\n      uid name type since until endless imageUrl\n      videos { title youtube start }\n      pickups {\n        type rerun since until\n        student { uid attackType defenseType role }\n        studentName\n      }\n    }\n  }\n": typeof types.EventDetailDocument,
    "\n  query EventStages($eventUid: String!) {\n    event(uid: $eventUid) {\n      stages {\n        difficulty index entryAp\n        rewards {\n          item {\n            itemId name imageId\n            eventBonuses {\n              student { uid role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n": typeof types.EventStagesDocument,
    "\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        __typename uid name since until confirmed\n        ... on Event {\n          eventType: type\n          rerun endless\n          pickups {\n            type rerun since until\n            student { uid attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n": typeof types.FutureContentsDocument,
    "\n  query AllRaid {\n    raids {\n      nodes {\n        uid type name boss since until terrain attackType rankVisible\n        defenseTypes { defenseType difficulty }\n      }\n    }\n  }\n": typeof types.AllRaidDocument,
    "\n  query RaidDetail($uid: String!) {\n    raid(uid: $uid) {\n      uid type name boss since until terrain attackType rankVisible\n      defenseTypes { defenseType difficulty }\n      videos(first: 1) {\n        pageInfo { hasNextPage }\n      }\n      statistics {\n        student { uid name }\n        slotsByTier { tier }\n        assistsByTier { tier }\n      }\n    }\n  }\n": typeof types.RaidDetailDocument,
    "\n  query LatestRaid($untilAfter: ISO8601DateTime!) {\n    raids(types: [total_assault, elimination], untilAfter: $untilAfter) {\n      nodes { uid type name boss since until terrain attackType rankVisible }\n    }\n  }\n": typeof types.LatestRaidDocument,
    "\n  query RaidRanks($defenseType: Defense, $raidUid: String!, $includeStudents: [RaidRankFilter!], $excludeStudents: [RaidRankFilter!], $rankAfter: Int, $rankBefore: Int) {\n    raid(uid: $raidUid) {\n      rankVisible\n      ranks(defenseType: $defenseType, first: 11, rankAfter: $rankAfter, rankBefore: $rankBefore, includeStudents: $includeStudents, excludeStudents: $excludeStudents) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier level isAssist\n            student { uid name }\n          }\n        }\n        video { youtubeId }\n      }\n    }\n  }\n": typeof types.RaidRanksDocument,
    "\n  query RaidStatistics($uid: String!, $defenseType: Defense!) {\n    raid(uid: $uid) {\n      statistics(defenseType: $defenseType) {\n        student { uid name role }\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n": typeof types.RaidStatisticsDocument,
    "\n  query RaidVideos($uid: String!, $first: Int, $after: String, $sort: VideoSortEnum) {\n    raid(uid: $uid) {\n      videos(first: $first, after: $after, sort: $sort) {\n        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }\n        edges {\n          node { id title score youtubeId thumbnailUrl publishedAt }\n        }\n      }\n    }\n  }\n": typeof types.RaidVideosDocument,
    "\n  query StudentDetail($uid: String!, $raidSince: ISO8601DateTime!) {\n    student(uid: $uid) {\n      name uid attackType defenseType role school schaleDbId\n      pickups {\n        since until\n        event { type uid name rerun imageUrl }\n      }\n      raidStatistics(raidSince: $raidSince) {\n        raid { uid name boss type since until terrain }\n        difficulty\n        defenseType\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n": typeof types.StudentDetailDocument,
};
const documents: Documents = {
    "\n  query AllStudents {\n    students {\n      uid\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n": types.AllStudentsDocument,
    "\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        uid name since\n        pickups {\n          type rerun\n          student { uid schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n": types.UserFuturesDocument,
    "\n  query RaidForParty {\n    raids {\n      nodes { uid name type boss terrain since }\n    }\n  }\n": types.RaidForPartyDocument,
    "\n  query RaidForPartyEdit {\n    raids {\n      nodes { uid name type boss terrain since until }\n    }\n  }\n": types.RaidForPartyEditDocument,
    "\n  query UserPickupEvents($eventUids: [String!]!) {\n    events(uids: $eventUids) {\n      nodes {\n        uid name type since\n        pickups {\n          student { uid }\n        }\n      }\n    }\n  }\n": types.UserPickupEventsDocument,
    "\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        uid name since until type rerun\n        pickups {\n          student { uid }\n          studentName\n        }\n      }\n    }\n  }\n": types.PickupEventsDocument,
    "\n  query Sitemap {\n    contents {\n      nodes { __typename uid until }\n    }\n    students { uid }\n  }\n": types.SitemapDocument,
    "\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        __typename name since until endless uid type rerun\n        pickups {\n          type rerun since until\n          student { uid name attackType defenseType role schaleDbId }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until uid type boss attackType defenseType terrain\n      }\n    }\n  }\n": types.IndexDocument,
    "\n  query EventDetail($eventUid: String!) {\n    event(uid: $eventUid) {\n      uid name type since until endless imageUrl\n      videos { title youtube start }\n      pickups {\n        type rerun since until\n        student { uid attackType defenseType role }\n        studentName\n      }\n    }\n  }\n": types.EventDetailDocument,
    "\n  query EventStages($eventUid: String!) {\n    event(uid: $eventUid) {\n      stages {\n        difficulty index entryAp\n        rewards {\n          item {\n            itemId name imageId\n            eventBonuses {\n              student { uid role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n": types.EventStagesDocument,
    "\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        __typename uid name since until confirmed\n        ... on Event {\n          eventType: type\n          rerun endless\n          pickups {\n            type rerun since until\n            student { uid attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n": types.FutureContentsDocument,
    "\n  query AllRaid {\n    raids {\n      nodes {\n        uid type name boss since until terrain attackType rankVisible\n        defenseTypes { defenseType difficulty }\n      }\n    }\n  }\n": types.AllRaidDocument,
    "\n  query RaidDetail($uid: String!) {\n    raid(uid: $uid) {\n      uid type name boss since until terrain attackType rankVisible\n      defenseTypes { defenseType difficulty }\n      videos(first: 1) {\n        pageInfo { hasNextPage }\n      }\n      statistics {\n        student { uid name }\n        slotsByTier { tier }\n        assistsByTier { tier }\n      }\n    }\n  }\n": types.RaidDetailDocument,
    "\n  query LatestRaid($untilAfter: ISO8601DateTime!) {\n    raids(types: [total_assault, elimination], untilAfter: $untilAfter) {\n      nodes { uid type name boss since until terrain attackType rankVisible }\n    }\n  }\n": types.LatestRaidDocument,
    "\n  query RaidRanks($defenseType: Defense, $raidUid: String!, $includeStudents: [RaidRankFilter!], $excludeStudents: [RaidRankFilter!], $rankAfter: Int, $rankBefore: Int) {\n    raid(uid: $raidUid) {\n      rankVisible\n      ranks(defenseType: $defenseType, first: 11, rankAfter: $rankAfter, rankBefore: $rankBefore, includeStudents: $includeStudents, excludeStudents: $excludeStudents) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier level isAssist\n            student { uid name }\n          }\n        }\n        video { youtubeId }\n      }\n    }\n  }\n": types.RaidRanksDocument,
    "\n  query RaidStatistics($uid: String!, $defenseType: Defense!) {\n    raid(uid: $uid) {\n      statistics(defenseType: $defenseType) {\n        student { uid name role }\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n": types.RaidStatisticsDocument,
    "\n  query RaidVideos($uid: String!, $first: Int, $after: String, $sort: VideoSortEnum) {\n    raid(uid: $uid) {\n      videos(first: $first, after: $after, sort: $sort) {\n        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }\n        edges {\n          node { id title score youtubeId thumbnailUrl publishedAt }\n        }\n      }\n    }\n  }\n": types.RaidVideosDocument,
    "\n  query StudentDetail($uid: String!, $raidSince: ISO8601DateTime!) {\n    student(uid: $uid) {\n      name uid attackType defenseType role school schaleDbId\n      pickups {\n        since until\n        event { type uid name rerun imageUrl }\n      }\n      raidStatistics(raidSince: $raidSince) {\n        raid { uid name boss type since until terrain }\n        difficulty\n        defenseType\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n": types.StudentDetailDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllStudents {\n    students {\n      uid\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n"): (typeof documents)["\n  query AllStudents {\n    students {\n      uid\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        uid name since\n        pickups {\n          type rerun\n          student { uid schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        uid name since\n        pickups {\n          type rerun\n          student { uid schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidForParty {\n    raids {\n      nodes { uid name type boss terrain since }\n    }\n  }\n"): (typeof documents)["\n  query RaidForParty {\n    raids {\n      nodes { uid name type boss terrain since }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidForPartyEdit {\n    raids {\n      nodes { uid name type boss terrain since until }\n    }\n  }\n"): (typeof documents)["\n  query RaidForPartyEdit {\n    raids {\n      nodes { uid name type boss terrain since until }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserPickupEvents($eventUids: [String!]!) {\n    events(uids: $eventUids) {\n      nodes {\n        uid name type since\n        pickups {\n          student { uid }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserPickupEvents($eventUids: [String!]!) {\n    events(uids: $eventUids) {\n      nodes {\n        uid name type since\n        pickups {\n          student { uid }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        uid name since until type rerun\n        pickups {\n          student { uid }\n          studentName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        uid name since until type rerun\n        pickups {\n          student { uid }\n          studentName\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Sitemap {\n    contents {\n      nodes { __typename uid until }\n    }\n    students { uid }\n  }\n"): (typeof documents)["\n  query Sitemap {\n    contents {\n      nodes { __typename uid until }\n    }\n    students { uid }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        __typename name since until endless uid type rerun\n        pickups {\n          type rerun since until\n          student { uid name attackType defenseType role schaleDbId }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until uid type boss attackType defenseType terrain\n      }\n    }\n  }\n"): (typeof documents)["\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        __typename name since until endless uid type rerun\n        pickups {\n          type rerun since until\n          student { uid name attackType defenseType role schaleDbId }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until uid type boss attackType defenseType terrain\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventDetail($eventUid: String!) {\n    event(uid: $eventUid) {\n      uid name type since until endless imageUrl\n      videos { title youtube start }\n      pickups {\n        type rerun since until\n        student { uid attackType defenseType role }\n        studentName\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventDetail($eventUid: String!) {\n    event(uid: $eventUid) {\n      uid name type since until endless imageUrl\n      videos { title youtube start }\n      pickups {\n        type rerun since until\n        student { uid attackType defenseType role }\n        studentName\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventStages($eventUid: String!) {\n    event(uid: $eventUid) {\n      stages {\n        difficulty index entryAp\n        rewards {\n          item {\n            itemId name imageId\n            eventBonuses {\n              student { uid role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventStages($eventUid: String!) {\n    event(uid: $eventUid) {\n      stages {\n        difficulty index entryAp\n        rewards {\n          item {\n            itemId name imageId\n            eventBonuses {\n              student { uid role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        __typename uid name since until confirmed\n        ... on Event {\n          eventType: type\n          rerun endless\n          pickups {\n            type rerun since until\n            student { uid attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        __typename uid name since until confirmed\n        ... on Event {\n          eventType: type\n          rerun endless\n          pickups {\n            type rerun since until\n            student { uid attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllRaid {\n    raids {\n      nodes {\n        uid type name boss since until terrain attackType rankVisible\n        defenseTypes { defenseType difficulty }\n      }\n    }\n  }\n"): (typeof documents)["\n  query AllRaid {\n    raids {\n      nodes {\n        uid type name boss since until terrain attackType rankVisible\n        defenseTypes { defenseType difficulty }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidDetail($uid: String!) {\n    raid(uid: $uid) {\n      uid type name boss since until terrain attackType rankVisible\n      defenseTypes { defenseType difficulty }\n      videos(first: 1) {\n        pageInfo { hasNextPage }\n      }\n      statistics {\n        student { uid name }\n        slotsByTier { tier }\n        assistsByTier { tier }\n      }\n    }\n  }\n"): (typeof documents)["\n  query RaidDetail($uid: String!) {\n    raid(uid: $uid) {\n      uid type name boss since until terrain attackType rankVisible\n      defenseTypes { defenseType difficulty }\n      videos(first: 1) {\n        pageInfo { hasNextPage }\n      }\n      statistics {\n        student { uid name }\n        slotsByTier { tier }\n        assistsByTier { tier }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LatestRaid($untilAfter: ISO8601DateTime!) {\n    raids(types: [total_assault, elimination], untilAfter: $untilAfter) {\n      nodes { uid type name boss since until terrain attackType rankVisible }\n    }\n  }\n"): (typeof documents)["\n  query LatestRaid($untilAfter: ISO8601DateTime!) {\n    raids(types: [total_assault, elimination], untilAfter: $untilAfter) {\n      nodes { uid type name boss since until terrain attackType rankVisible }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidRanks($defenseType: Defense, $raidUid: String!, $includeStudents: [RaidRankFilter!], $excludeStudents: [RaidRankFilter!], $rankAfter: Int, $rankBefore: Int) {\n    raid(uid: $raidUid) {\n      rankVisible\n      ranks(defenseType: $defenseType, first: 11, rankAfter: $rankAfter, rankBefore: $rankBefore, includeStudents: $includeStudents, excludeStudents: $excludeStudents) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier level isAssist\n            student { uid name }\n          }\n        }\n        video { youtubeId }\n      }\n    }\n  }\n"): (typeof documents)["\n  query RaidRanks($defenseType: Defense, $raidUid: String!, $includeStudents: [RaidRankFilter!], $excludeStudents: [RaidRankFilter!], $rankAfter: Int, $rankBefore: Int) {\n    raid(uid: $raidUid) {\n      rankVisible\n      ranks(defenseType: $defenseType, first: 11, rankAfter: $rankAfter, rankBefore: $rankBefore, includeStudents: $includeStudents, excludeStudents: $excludeStudents) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier level isAssist\n            student { uid name }\n          }\n        }\n        video { youtubeId }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidStatistics($uid: String!, $defenseType: Defense!) {\n    raid(uid: $uid) {\n      statistics(defenseType: $defenseType) {\n        student { uid name role }\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n"): (typeof documents)["\n  query RaidStatistics($uid: String!, $defenseType: Defense!) {\n    raid(uid: $uid) {\n      statistics(defenseType: $defenseType) {\n        student { uid name role }\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidVideos($uid: String!, $first: Int, $after: String, $sort: VideoSortEnum) {\n    raid(uid: $uid) {\n      videos(first: $first, after: $after, sort: $sort) {\n        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }\n        edges {\n          node { id title score youtubeId thumbnailUrl publishedAt }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query RaidVideos($uid: String!, $first: Int, $after: String, $sort: VideoSortEnum) {\n    raid(uid: $uid) {\n      videos(first: $first, after: $after, sort: $sort) {\n        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }\n        edges {\n          node { id title score youtubeId thumbnailUrl publishedAt }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentDetail($uid: String!, $raidSince: ISO8601DateTime!) {\n    student(uid: $uid) {\n      name uid attackType defenseType role school schaleDbId\n      pickups {\n        since until\n        event { type uid name rerun imageUrl }\n      }\n      raidStatistics(raidSince: $raidSince) {\n        raid { uid name boss type since until terrain }\n        difficulty\n        defenseType\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n"): (typeof documents)["\n  query StudentDetail($uid: String!, $raidSince: ISO8601DateTime!) {\n    student(uid: $uid) {\n      name uid attackType defenseType role school schaleDbId\n      pickups {\n        since until\n        event { type uid name rerun imageUrl }\n      }\n      raidStatistics(raidSince: $raidSince) {\n        raid { uid name boss type since until terrain }\n        difficulty\n        defenseType\n        slotsCount\n        slotsByTier { tier count }\n        assistsCount\n        assistsByTier { tier count }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;