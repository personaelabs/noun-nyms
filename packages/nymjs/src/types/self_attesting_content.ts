import { NymProof } from './proof';
import { MerkleProof } from '@personaelabs/spartan-ecdsa';

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
    throw new Error('Method not implemented.');
  }
  contentData: ContentData;
  proof: NymProof;
  merkleRoot: bigint;

  constructor(contentData: ContentData, proof: NymProof, merkleRoot: bigint) {
    this.contentData = contentData;
    this.proof = proof;
    this.merkleRoot = merkleRoot;
  }
}

export class ContentWithSig implements SelfAttestingContent {
  id(): string {
    throw new Error('Method not implemented.');
  }
  contentData: ContentData;
  sig: string;
  signerEthAddress: string;

  constructor(contentData: ContentData, sig: string, signerEthAddress: string) {
    this.contentData = contentData;
    this.sig = sig;
    this.signerEthAddress = signerEthAddress;
  }
}

export type ContentData = {
  title: string;
  body: string;
  parentContentId: string;
  timestamp: number;
  // NOTE: do we want a version of this that expresses the entire graph fully?
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
  merkleProof: MerkleProof;

  constructor(
    contentId: string,
    signature: string,
    signerEthAddress: string,
    merkleRoot: bigint,
    merkleProof: MerkleProof,
  ) {
    this.contentId = contentId;
    this.signature = signature;
    this.signerEthAddress = signerEthAddress;
    this.merkleRoot = merkleRoot;
    this.merkleProof = merkleProof;
  }
}
