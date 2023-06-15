import wasm, { init } from '../wasm';
import { Profiler } from './profiler';
import {
  loadCircuit,
  deserializeNymAttestation,
  toTypedNymName,
  eip712MsgHash,
  serializePublicInput,
  toTypedContent,
} from '../utils';
import { Post, NymProofAuxiliary, PublicInput } from '../lib';
import { computeEffEcdsaPubInput } from '../eff_ecdsa';
import { bigIntToHex } from '@ethereumjs/util';

// NOTE: we'll subsidize storage of these files for now
const CIRCUIT_URL =
  'https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.circuit';

export type VerifierConfig = {
  circuitBin?: Buffer;
  circuitUrl?: string;
  enableProfiler?: boolean;
};

export class NymVerifier extends Profiler {
  circuit: string;
  circuitBin?: Buffer;
  constructor(options: VerifierConfig) {
    super({ enabled: options?.enableProfiler });

    this.circuitBin = options.circuitBin;
    this.circuit = options.circuitUrl || CIRCUIT_URL;
  }

  async initWasm() {
    await init();
  }

  verifyPublicInput(
    post: Post,
    nymName: Buffer,
    publicInput: PublicInput,
    auxiliary: NymProofAuxiliary,
  ): boolean {
    let isNymSigPubInputValid;

    try {
      const typedNymName = toTypedNymName(nymName.toString('utf8'));
      const typedNymNameHash = eip712MsgHash(
        typedNymName.domain,
        typedNymName.types,
        typedNymName.value,
      );

      const expectedCircuitInput = computeEffEcdsaPubInput(
        auxiliary.nymSigR,
        auxiliary.nymSigV,
        typedNymNameHash,
      );

      isNymSigPubInputValid =
        expectedCircuitInput.Tx === publicInput.nymSigTx &&
        expectedCircuitInput.Ty === publicInput.nymSigTy &&
        expectedCircuitInput.Ux === publicInput.nymSigUx &&
        expectedCircuitInput.Uy === publicInput.nymSigUy;
    } catch (_e) {
      isNymSigPubInputValid = false;
    }

    let isContentSigPubInputValid;
    try {
      const typedContentMessage = toTypedContent(post.content);

      const typedContentMessageHash = eip712MsgHash(
        typedContentMessage.domain,
        typedContentMessage.types,
        typedContentMessage.value,
      );

      const expectedCircuitInput = computeEffEcdsaPubInput(
        auxiliary.contentSigR,
        auxiliary.contentSigV,
        typedContentMessageHash,
      );

      isContentSigPubInputValid =
        expectedCircuitInput.Tx === publicInput.contentSigTx &&
        expectedCircuitInput.Ty === publicInput.contentSigTy &&
        expectedCircuitInput.Ux === publicInput.contentSigUx &&
        expectedCircuitInput.Uy === publicInput.contentSigUy;
    } catch (_e) {
      isContentSigPubInputValid = false;
    }

    return isNymSigPubInputValid && isContentSigPubInputValid;
  }

  async verify(post: Post): Promise<boolean> {
    this.time('Load circuit');
    const circuitBin = this.circuitBin || (await loadCircuit(this.circuit));
    this.timeEnd('Load circuit');

    const { nymName, proof, publicInput, auxiliary } = deserializeNymAttestation(post.attestation);

    // Verify that the content.groupRoot matches the `root` in the public input
    if (post.content.groupRoot !== bigIntToHex(publicInput.root)) {
      return false;
    }

    this.time('Verify public input');
    const isPublicInputValid = this.verifyPublicInput(
      post,
      Buffer.from(nymName, 'utf-8'),
      publicInput,
      auxiliary,
    );
    this.timeEnd('Verify public input');

    this.time('Verify proof');
    let isProofValid;
    try {
      isProofValid = await wasm.verify(circuitBin, proof, serializePublicInput(publicInput));
    } catch (_e) {
      isProofValid = false;
    }

    this.timeEnd('Verify proof');
    return isProofValid && isPublicInputValid;
  }
}
