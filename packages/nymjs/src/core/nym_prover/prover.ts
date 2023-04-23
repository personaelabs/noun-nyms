const snarkjs = require('snarkjs');

import { NymProof, NymProofInput } from '../../types/nym_prover';
import wasm, { init } from '../../wasm';
import { Profiler } from './profiler';
import { bufferToBigInt } from '../utils';
import { NymCircuitInput } from './input';

// NOTE: we'll subsidize storage of these files for now
export const CIRCUIT_URL =
  'https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.circuit';
export const WITNESS_GEN_WASM_URL =
  'https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.wasm';

export type ProverConfig = {
  circuit_url?: string;
  witness_gen_wasm_url?: string;
  enableProfiler?: boolean;
};

export class NymProver extends Profiler {
  circuit: string;
  witnessGenWasm: string;

  constructor(options: ProverConfig) {
    super({ enabled: options?.enableProfiler });

    this.circuit = options.circuit_url || CIRCUIT_URL;
    this.witnessGenWasm = options.witness_gen_wasm_url || WITNESS_GEN_WASM_URL;
  }

  async initWasm() {
    this.time('init wasm');
    await init();
    this.timeEnd('init wasm');
  }

  // NOTE: return information for verification
  async prove(input: NymProofInput): Promise<NymProof> {
    this.time('generate witness');
    const witnessInput = {
      content: bufferToBigInt(Buffer.from('dummy', 'utf8')),
      nym: bufferToBigInt(Buffer.from('dummy nym', 'utf8')),
      nymHash: bufferToBigInt(Buffer.from(input.nymHash, 'hex')),

      // Efficient ECDSA signature of the nym
      nymSigTx: input.nymSig.Tx,
      nymSigTy: input.nymSig.Ty,
      nymSigUx: input.nymSig.Ux,
      nymSigUy: input.nymSig.Uy,
      nymSigS: input.nymSig.s,

      // Efficient ECDSA signature of the content
      contentSigTx: input.contentSig.Tx,
      contentSigTy: input.contentSig.Ty,
      contentSigUx: input.contentSig.Ux,
      contentSigUy: input.contentSig.Uy,
      contentSigS: input.contentSig.s,

      // Merkle proof
      siblings: input.membershipProof.siblings,
      pathIndices: input.membershipProof.pathIndices,
      root: input.membershipProof.root,
    };

    const witness: {
      type: string;
      data?: any;
    } = {
      type: 'mem',
    };
    await snarkjs.wtns.calculate(witnessInput, this.witnessGenWasm, witness);
    this.timeEnd('generate witness');

    this.time('load circuit');
    const response = await fetch(CIRCUIT_URL);
    const circuit = await response.arrayBuffer();
    const circuitBin = new Uint8Array(circuit);
    this.timeEnd('load circuit');

    const inputSer = new NymCircuitInput(input).serialize();

    this.time('prove');
    const proof = wasm.prove(circuitBin, witness.data, inputSer);
    this.timeEnd('prove');

    return {
      proof,
      // TODO: Only return the public input
      serializedPublicInput: inputSer,
    };
  }
}
