import type { TypedDocumentNode, AnyVariables, OperationResult } from "urql";
import { createClient, fetchExchange } from "urql";

const URL = "https://baql.mollulog.net/graphql";

export async function runQuery<Data = any, Variables extends AnyVariables = AnyVariables>(
  query: TypedDocumentNode<Data, Variables>,
  variables: Variables,
): Promise<OperationResult<Data, Variables>> {
  const client = createClient({ url: URL, exchanges: [fetchExchange] });
  return client.query<Data, Variables>(query, variables).toPromise();
}
