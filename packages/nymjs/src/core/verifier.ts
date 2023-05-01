import wasm, { init } from '../wasm';
import { Profiler } from './profiler';
import { loadCircuit } from '../utils';
import { NymFullProof } from '../lib';

// NOTE: we'll subsidize storage of these files for now
const CIRCUIT_URL =
  'https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.circuit';

export type VerifierConfig = {
  circuitUrl?: string;
  enableProfiler?: boolean;
};

export class NymVerifier extends Profiler {
  circuit: string;
  constructor(options: VerifierConfig) {
    super({ enabled: options?.enableProfiler });

    this.circuit = options.circuitUrl || CIRCUIT_URL;
  }

  async initWasm() {
    await init();
  }

  async verify(fullProof: NymFullProof): Promise<boolean> {
    this.time('Load circuit');
    const circuitBin = await loadCircuit(this.circuit);
    this.timeEnd('Load circuit');

    this.time('Verify public input');
    const isPublicInputValid = fullProof.publicInput.verify();
    this.timeEnd('Verify public input');

    this.time('Verify proof');
    let isProofValid;
    try {
      isProofValid = await wasm.verify(
        circuitBin,
        fullProof.proof,
        fullProof.publicInput.serialize(),
      );
    } catch (_e) {
      isProofValid = false;
    }

    this.timeEnd('Verify proof');
    return isProofValid && isPublicInputValid;
  }
}
