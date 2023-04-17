import { execute } from "../.graphclient";
import { DocumentNode } from "graphql";
import { gql } from "graphql-tag";

export function buildOwnersQuery(blockHeight: number) {
  return gql`
    query {
      accounts(first: 1000, where: { tokenBalance_gte: 1 }, block: { number: ${blockHeight}}) {
        id
        tokenBalance
      }
    }
  `;
}

export function buildDelegatesQuery(blockHeight: number) {
  return gql`
    query {
      delegates(first: 1000, where: { delegatedVotes_gte: 1 }, block: { number: ${blockHeight}}) {
        id
        delegatedVotes
      }
    }
  `;
}

// TODO: error handling
export async function executeQuery(query: DocumentNode) {
  const res = await execute(query, {});
  return res["data"];
}
