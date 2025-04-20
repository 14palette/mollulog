import type { TypedDocumentNode, AnyVariables, OperationResult } from "urql";
import { createClient, cacheExchange, fetchExchange, debugExchange } from "urql";
import { requestPolicyExchange } from "@urql/exchange-request-policy";
import type { DocumentNode } from "graphql/language";

const URL = process.env.BAQL_URL ?? "https://baql.mollulog.net/graphql";

export const client = createClient({
  url: URL,
  exchanges: [
    debugExchange,
    requestPolicyExchange({ ttl: 60_000, shouldUpgrade: () => true }),
    cacheExchange,
    fetchExchange,
  ],
});

export async function runQuery<Data = any, Variables extends AnyVariables = AnyVariables>(
  query: TypedDocumentNode<Data, Variables>,
  variables: Variables,
): Promise<OperationResult<Data, Variables>> {
  return client.query<Data, Variables>(query, variables).toPromise();
}
