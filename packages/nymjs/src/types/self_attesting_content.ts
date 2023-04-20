/**
 * SelfAttestingContent is data alongside a proof or signature that validates it.
 *
 * It's the key primitive in a Nym content graph.
 */
export interface SelfAttestingContent {
  /**
   * id() is used to create a unique, fixed-length reference to this content that obviates storing the entire content graph
   * just to keep track of a single piece of content.
   */
  id(): string;

  contentData: ContentData;
}

export class ContentWithNymProof implements SelfAttestingContent {
  id(): string {
    throw new Error("Method not implemented.");
  }
  contentData: ContentData;
  proof: NymProof;
  merkleRoot: bigint;
}

export class ContentWithSig implements SelfAttestingContent {
  id(): string {
    throw new Error("Method not implemented.");
  }
  contentData: ContentData;
  sig: string;
  signerEthAddress: string;
}

export interface NymProof {
  proof: Uint8Array;
  publicInput: Uint8Array;
}

export type ContentData = {
  content: string;
  parentContentId: string;
  // NOTE: do we want a version of this that expresses the entire graph fully?
  // TODO: metadata?
};

/**
 * A ContentEmbellishment is additional data that can be added to a given piece of content that may influence its interpretation.
 *
 * Like upvotes.
 */
export interface ContentEmbellishment {
  contentId: string;
}

export class DoxedGroupUpvote implements ContentEmbellishment {
  contentId: string;
  signature: string;
  signerEthAddress: string;
  merkleRoot: bigint;
  // TODO: merkle proof
}
