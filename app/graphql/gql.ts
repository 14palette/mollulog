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
    "\n  query AllStudents {\n    students {\n      id: studentId\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n": typeof types.AllStudentsDocument,
    "\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        eventId\n        name\n        since\n        pickups {\n          type\n          rerun\n          student { studentId schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n": typeof types.UserFuturesDocument,
    "\n  query RaidForParty {\n    raids {\n      nodes { raidId name type boss terrain since }\n    }\n  }\n": typeof types.RaidForPartyDocument,
    "\n  query UserPickupEvents($eventIds: [String!]!) {\n    events(eventIds: $eventIds) {\n      nodes {\n        eventId name type since\n        pickups {\n          student { studentId }\n        }\n      }\n    }\n  }\n": typeof types.UserPickupEventsDocument,
    "\n  query Sitemap {\n    contents {\n      nodes {\n        __typename\n        ... on Event {\n          id: eventId\n          until\n        }\n        ... on Raid {\n          id: raidId\n          until\n        }\n      }\n    }\n  }\n": typeof types.SitemapDocument,
    "\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        name since until eventId type rerun\n        pickups {\n          type rerun\n          student { studentId name }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until raidId type boss attackType defenseType terrain\n      }\n    }\n  }\n": typeof types.IndexDocument,
    "\n  query RaidForPartyEdit {\n    raids {\n      nodes { raidId name type boss terrain since until }\n    }\n  }\n": typeof types.RaidForPartyEditDocument,
    "\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        eventId name since until type rerun\n        pickups {\n          student { studentId }\n          studentName\n        }\n      }\n    }\n  }\n": typeof types.PickupEventsDocument,
    "\n  query ProfileStudents {\n    students { studentId name }\n  }\n": typeof types.ProfileStudentsDocument,
    "\n  query EventDetail($eventId: String!) {\n    event(eventId: $eventId) {\n      eventId\n      name\n      type\n      since\n      until\n      imageUrl\n      videos {\n        title\n        youtube\n        start\n      }\n      pickups {\n        type\n        rerun\n        student { studentId attackType defenseType role schaleDbId }\n        studentName\n      }\n    }\n  }\n": typeof types.EventDetailDocument,
    "\n  query EventStages($eventId: String!) {\n    event(eventId: $eventId) {\n      stages {\n        difficulty\n        index\n        entryAp\n        rewards {\n          item {\n            itemId\n            name\n            imageId\n            eventBonuses {\n              student { studentId role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n": typeof types.EventStagesDocument,
    "\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        name\n        since\n        until\n        confirmed\n        ... on Event {\n          contentId: eventId\n          eventType: type\n          rerun\n          pickups {\n            type\n            rerun\n            student { studentId attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          contentId: raidId\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n": typeof types.FutureContentsDocument,
    "\n  query RaidRanks($raidId: String!, $filter: [RaidRankFilter!]) {\n    raid(raidId: $raidId) {\n      rankVisible\n      ranks(filter: $filter) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier\n            student { studentId name }\n          }\n        }\n      }\n    }\n  }\n": typeof types.RaidRanksDocument,
    "\n  query RaidDetail($raidId: String!) {\n    raid(raidId: $raidId) {\n      raidId type name boss since until terrain attackType defenseType\n    }\n  }\n": typeof types.RaidDetailDocument,
    "\n  query SearchSensei {\n    students { studentId name }\n  }\n": typeof types.SearchSenseiDocument,
};
const documents: Documents = {
    "\n  query AllStudents {\n    students {\n      id: studentId\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n": types.AllStudentsDocument,
    "\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        eventId\n        name\n        since\n        pickups {\n          type\n          rerun\n          student { studentId schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n": types.UserFuturesDocument,
    "\n  query RaidForParty {\n    raids {\n      nodes { raidId name type boss terrain since }\n    }\n  }\n": types.RaidForPartyDocument,
    "\n  query UserPickupEvents($eventIds: [String!]!) {\n    events(eventIds: $eventIds) {\n      nodes {\n        eventId name type since\n        pickups {\n          student { studentId }\n        }\n      }\n    }\n  }\n": types.UserPickupEventsDocument,
    "\n  query Sitemap {\n    contents {\n      nodes {\n        __typename\n        ... on Event {\n          id: eventId\n          until\n        }\n        ... on Raid {\n          id: raidId\n          until\n        }\n      }\n    }\n  }\n": types.SitemapDocument,
    "\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        name since until eventId type rerun\n        pickups {\n          type rerun\n          student { studentId name }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until raidId type boss attackType defenseType terrain\n      }\n    }\n  }\n": types.IndexDocument,
    "\n  query RaidForPartyEdit {\n    raids {\n      nodes { raidId name type boss terrain since until }\n    }\n  }\n": types.RaidForPartyEditDocument,
    "\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        eventId name since until type rerun\n        pickups {\n          student { studentId }\n          studentName\n        }\n      }\n    }\n  }\n": types.PickupEventsDocument,
    "\n  query ProfileStudents {\n    students { studentId name }\n  }\n": types.ProfileStudentsDocument,
    "\n  query EventDetail($eventId: String!) {\n    event(eventId: $eventId) {\n      eventId\n      name\n      type\n      since\n      until\n      imageUrl\n      videos {\n        title\n        youtube\n        start\n      }\n      pickups {\n        type\n        rerun\n        student { studentId attackType defenseType role schaleDbId }\n        studentName\n      }\n    }\n  }\n": types.EventDetailDocument,
    "\n  query EventStages($eventId: String!) {\n    event(eventId: $eventId) {\n      stages {\n        difficulty\n        index\n        entryAp\n        rewards {\n          item {\n            itemId\n            name\n            imageId\n            eventBonuses {\n              student { studentId role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n": types.EventStagesDocument,
    "\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        name\n        since\n        until\n        confirmed\n        ... on Event {\n          contentId: eventId\n          eventType: type\n          rerun\n          pickups {\n            type\n            rerun\n            student { studentId attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          contentId: raidId\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n": types.FutureContentsDocument,
    "\n  query RaidRanks($raidId: String!, $filter: [RaidRankFilter!]) {\n    raid(raidId: $raidId) {\n      rankVisible\n      ranks(filter: $filter) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier\n            student { studentId name }\n          }\n        }\n      }\n    }\n  }\n": types.RaidRanksDocument,
    "\n  query RaidDetail($raidId: String!) {\n    raid(raidId: $raidId) {\n      raidId type name boss since until terrain attackType defenseType\n    }\n  }\n": types.RaidDetailDocument,
    "\n  query SearchSensei {\n    students { studentId name }\n  }\n": types.SearchSenseiDocument,
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
export function graphql(source: "\n  query AllStudents {\n    students {\n      id: studentId\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n"): (typeof documents)["\n  query AllStudents {\n    students {\n      id: studentId\n      name\n      school\n      initialTier\n      order\n      attackType\n      defenseType\n      role\n      equipments\n      released\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        eventId\n        name\n        since\n        pickups {\n          type\n          rerun\n          student { studentId schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserFutures($now: ISO8601DateTime!) {\n    events(first: 999, untilAfter: $now) {\n      nodes {\n        eventId\n        name\n        since\n        pickups {\n          type\n          rerun\n          student { studentId schaleDbId name school equipments }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidForParty {\n    raids {\n      nodes { raidId name type boss terrain since }\n    }\n  }\n"): (typeof documents)["\n  query RaidForParty {\n    raids {\n      nodes { raidId name type boss terrain since }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserPickupEvents($eventIds: [String!]!) {\n    events(eventIds: $eventIds) {\n      nodes {\n        eventId name type since\n        pickups {\n          student { studentId }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserPickupEvents($eventIds: [String!]!) {\n    events(eventIds: $eventIds) {\n      nodes {\n        eventId name type since\n        pickups {\n          student { studentId }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Sitemap {\n    contents {\n      nodes {\n        __typename\n        ... on Event {\n          id: eventId\n          until\n        }\n        ... on Raid {\n          id: raidId\n          until\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Sitemap {\n    contents {\n      nodes {\n        __typename\n        ... on Event {\n          id: eventId\n          until\n        }\n        ... on Raid {\n          id: raidId\n          until\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        name since until eventId type rerun\n        pickups {\n          type rerun\n          student { studentId name }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until raidId type boss attackType defenseType terrain\n      }\n    }\n  }\n"): (typeof documents)["\n  query Index($now: ISO8601DateTime!) {\n    events(untilAfter: $now, sinceBefore: $now) {\n      nodes {\n        name since until eventId type rerun\n        pickups {\n          type rerun\n          student { studentId name }\n        }\n      }\n    }\n    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {\n      nodes {\n        name since until raidId type boss attackType defenseType terrain\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidForPartyEdit {\n    raids {\n      nodes { raidId name type boss terrain since until }\n    }\n  }\n"): (typeof documents)["\n  query RaidForPartyEdit {\n    raids {\n      nodes { raidId name type boss terrain since until }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        eventId name since until type rerun\n        pickups {\n          student { studentId }\n          studentName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PickupEvents {\n    events(first: 9999) {\n      nodes {\n        eventId name since until type rerun\n        pickups {\n          student { studentId }\n          studentName\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProfileStudents {\n    students { studentId name }\n  }\n"): (typeof documents)["\n  query ProfileStudents {\n    students { studentId name }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventDetail($eventId: String!) {\n    event(eventId: $eventId) {\n      eventId\n      name\n      type\n      since\n      until\n      imageUrl\n      videos {\n        title\n        youtube\n        start\n      }\n      pickups {\n        type\n        rerun\n        student { studentId attackType defenseType role schaleDbId }\n        studentName\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventDetail($eventId: String!) {\n    event(eventId: $eventId) {\n      eventId\n      name\n      type\n      since\n      until\n      imageUrl\n      videos {\n        title\n        youtube\n        start\n      }\n      pickups {\n        type\n        rerun\n        student { studentId attackType defenseType role schaleDbId }\n        studentName\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventStages($eventId: String!) {\n    event(eventId: $eventId) {\n      stages {\n        difficulty\n        index\n        entryAp\n        rewards {\n          item {\n            itemId\n            name\n            imageId\n            eventBonuses {\n              student { studentId role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query EventStages($eventId: String!) {\n    event(eventId: $eventId) {\n      stages {\n        difficulty\n        index\n        entryAp\n        rewards {\n          item {\n            itemId\n            name\n            imageId\n            eventBonuses {\n              student { studentId role }\n              ratio\n            }\n          }\n          amount\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        name\n        since\n        until\n        confirmed\n        ... on Event {\n          contentId: eventId\n          eventType: type\n          rerun\n          pickups {\n            type\n            rerun\n            student { studentId attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          contentId: raidId\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FutureContents($now: ISO8601DateTime!) {\n    contents(untilAfter: $now, first: 9999) {\n      nodes {\n        name\n        since\n        until\n        confirmed\n        ... on Event {\n          contentId: eventId\n          eventType: type\n          rerun\n          pickups {\n            type\n            rerun\n            student { studentId attackType defenseType role schaleDbId }\n            studentName\n          }\n        }\n        ... on Raid {\n          contentId: raidId\n          raidType: type\n          rankVisible\n          boss terrain attackType defenseType\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidRanks($raidId: String!, $filter: [RaidRankFilter!]) {\n    raid(raidId: $raidId) {\n      rankVisible\n      ranks(filter: $filter) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier\n            student { studentId name }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query RaidRanks($raidId: String!, $filter: [RaidRankFilter!]) {\n    raid(raidId: $raidId) {\n      rankVisible\n      ranks(filter: $filter) {\n        rank score\n        parties {\n          partyIndex\n          slots {\n            slotIndex tier\n            student { studentId name }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RaidDetail($raidId: String!) {\n    raid(raidId: $raidId) {\n      raidId type name boss since until terrain attackType defenseType\n    }\n  }\n"): (typeof documents)["\n  query RaidDetail($raidId: String!) {\n    raid(raidId: $raidId) {\n      raidId type name boss since until terrain attackType defenseType\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchSensei {\n    students { studentId name }\n  }\n"): (typeof documents)["\n  query SearchSensei {\n    students { studentId name }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;