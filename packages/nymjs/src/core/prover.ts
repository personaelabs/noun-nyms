import { NymFullProof } from '../types';
import wasm, { init } from '../wasm';
import { Profiler } from './profiler';
import {
  bufferToBigInt,
  loadCircuit,
  snarkJsWitnessGen,
  computeEffECDSASig,
  computeNymHash,
} from '../utils';
import { EIP712TypedData } from '../types';
import { NymPublicInput } from './input';
import { MerkleProof } from '@personaelabs/spartan-ecdsa';

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

  constructor(options: ProverConfig) {
    super({ enabled: options?.enableProfiler });

    this.circuit = options.circuitUrl || CIRCUIT_URL;
    this.witnessGenWasm = options.witnessGenWasm || WITNESS_GEN_WASM_URL;
  }

  async initWasm() {
    await init();
  }

  async prove(
    typedNymCode: EIP712TypedData,
    typedContent: EIP712TypedData,
    nymSigStr: string,
    contentSigStr: string,
    membershipProof: MerkleProof,
  ): Promise<NymFullProof> {
    const nymSig = computeEffECDSASig(nymSigStr, typedNymCode);
    const contentSig = computeEffECDSASig(contentSigStr, typedContent);
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
    this.time('load circuit');
    const circuitBin = await loadCircuit(this.circuit);
    this.timeEnd('load circuit');

    const publicInput = new NymPublicInput(
      typedNymCode,
      typedContent,
      nymSig,
      contentSig,
      nymHash,
      membershipProof.root,
    );

    this.time('prove');
    const proof = wasm.prove(circuitBin, witness.data, publicInput.serialize());
    this.timeEnd('prove');

    const nymFullProof: NymFullProof = {
      proof,
      publicInput,
    };

    return nymFullProof;
  }
}
