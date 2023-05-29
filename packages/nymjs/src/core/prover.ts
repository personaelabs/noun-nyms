import { DOMAIN, CONTENT_MESSAGE_TYPES, NymProofAuxiliary, PublicInput, Content } from '../types';
import wasm, { init } from '../wasm';
import { Profiler } from './profiler';
import {
  bufferToBigInt,
  loadCircuit,
  snarkJsWitnessGen,
  computeEffECDSASig,
  computeNymHash,
  serializePublicInput,
  serializeNymAttestation,
  toTypedNymName,
  eip712MsgHash,
  pubToPrefixedAddress,
} from '../utils';
import { EIP712TypedData } from '../types';
import { MerkleProof, Tree, Poseidon } from '@personaelabs/spartan-ecdsa';
import { ecrecover, fromRpcSig } from '@ethereumjs/util';
import { INCONSISTENT_SIGNERS, INVALID_MERKLE_PROOF } from '../errors';

// NOTE: we'll subsidize storage of these files for now
export const CIRCUIT_URL =
  'https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.circuit';
export const WITNESS_GEN_WASM_URL =
  'https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.wasm';

export type ProverConfig = {
  circuitUrl?: string;
  witnessGenWasm?: string;
  enableProfiler?: boolean;
};

// Generates Content with attestationScheme = Spartan1
export class NymProver extends Profiler {
  circuit: string;
  witnessGenWasm: string;
  circuitBin?: Uint8Array;
  poseidon: Poseidon;

  constructor(options: ProverConfig) {
    super({ enabled: options?.enableProfiler });

    this.circuit = options.circuitUrl || CIRCUIT_URL;
    this.witnessGenWasm = options.witnessGenWasm || WITNESS_GEN_WASM_URL;
    this.poseidon = new Poseidon();
  }

  async initWasm() {
    await init();
  }

  async initPoseidon() {
    await this.poseidon.initWasm();
  }

  async loadCircuit() {
    if (!this.circuitBin) {
      this.circuitBin = await loadCircuit(this.circuit);
    }
  }

  private verifyMerkleProf(proof: MerkleProof, pubKeyHash: bigint) {
    const treeDepth = 20;
    const tree = new Tree(treeDepth, this.poseidon);
    if (!tree.verifyProof(proof, pubKeyHash)) {
      throw new Error(INVALID_MERKLE_PROOF);
    }
  }

  private recoverPubKey(sigStr: string, msgHash: Buffer): Buffer {
    const sig = fromRpcSig(sigStr);
    return ecrecover(msgHash, sig.v, sig.r, sig.s);
  }

  async prove(
    nymName: string,
    message: Content,
    nymSigStr: string,
    contentSigStr: string,
    membershipProof: MerkleProof,
  ): Promise<Buffer> {
    const typedNymName = toTypedNymName(nymName);
    const nymSig = computeEffECDSASig(nymSigStr, typedNymName);

    const typedContentMessage: EIP712TypedData = {
      domain: DOMAIN,
      types: CONTENT_MESSAGE_TYPES,
      value: message,
    };

    const contentSig = computeEffECDSASig(contentSigStr, typedContentMessage);

    // Verify that the signer of the nymSig and contentSig are the same

    await this.initPoseidon();

    // Recover the nym signer from the signature
    const nymSigPubKey = this.recoverPubKey(
      nymSigStr,
      eip712MsgHash(typedNymName.domain, typedNymName.types, typedNymName.value),
    );
    // Recover the content signer from the signature
    const contentSigPubKey = this.recoverPubKey(
      contentSigStr,
      eip712MsgHash(
        typedContentMessage.domain,
        typedContentMessage.types,
        typedContentMessage.value,
      ),
    );

    const nymSigAddr = pubToPrefixedAddress(nymSigPubKey);
    const contentSigAddr = pubToPrefixedAddress(contentSigPubKey);
    if (nymSigAddr !== contentSigAddr) {
      throw new Error(INCONSISTENT_SIGNERS(nymSigAddr, contentSigAddr));
    }

    this.verifyMerkleProf(membershipProof, this.poseidon.hashPubKey(nymSigPubKey));

    const nymHash = bufferToBigInt(Buffer.from(await computeNymHash(nymSigStr), 'hex'));

    this.time('generate witness');
    const witnessInput = {
      nymHash,

      // Efficient ECDSA signature of the nym
      nymSigTx: nymSig.Tx,
      nymSigTy: nymSig.Ty,
      nymSigUx: nymSig.Ux,
      nymSigUy: nymSig.Uy,
      nymSigS: nymSig.s,

      // Efficient ECDSA signature of the content
      contentSigTx: contentSig.Tx,
      contentSigTy: contentSig.Ty,
      contentSigUx: contentSig.Ux,
      contentSigUy: contentSig.Uy,
      contentSigS: contentSig.s,

      // Merkle proof
      siblings: membershipProof.siblings,
      pathIndices: membershipProof.pathIndices,
      root: membershipProof.root,
    };

    const witness = await snarkJsWitnessGen(witnessInput, this.witnessGenWasm);

    await this.initWasm();
    await this.loadCircuit();

    const publicInput: PublicInput = {
      root: membershipProof.root,
      nymSigTx: nymSig.Tx,
      nymSigTy: nymSig.Ty,
      nymSigUx: nymSig.Ux,
      nymSigUy: nymSig.Uy,
      nymHash,
      contentSigTx: contentSig.Tx,
      contentSigTy: contentSig.Ty,
      contentSigUx: contentSig.Ux,
      contentSigUy: contentSig.Uy,
    };
    const publicInputSer = serializePublicInput(publicInput);

    const auxiliaryProof: NymProofAuxiliary = {
      nymSigR: nymSig.r,
      nymSigV: nymSig.v,
      contentSigR: contentSig.r,
      contentSigV: contentSig.v,
    };

    this.time('prove');
    const proof = wasm.prove(this.circuitBin as Uint8Array, witness.data, publicInputSer);
    this.timeEnd('prove');

    const attestation = serializeNymAttestation(
      Buffer.from(proof),
      publicInput,
      auxiliaryProof,
      nymName,
    );

    return attestation;
  }
}
