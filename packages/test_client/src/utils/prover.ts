// TODO: these should be exported by spartan-ecdsa lib
import {
  snarkJsWitnessGen,
  loadCircuit,
  fromSig,
} from "@personaelabs/spartan-ecdsa/build/helpers/utils";

import wasm, {
  CircuitPubInput,
  computeEffEcdsaPubInput,
  init as initWasm,
  MerkleProof,
  PublicInput,
} from "@personaelabs/spartan-ecdsa";

const circuitFile =
  "https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.circuit";
const witnessGenWasm =
  "https://storage.googleapis.com/personae-proving-keys/nym/nym_ownership.wasm";

// TODO: util for sanitizing public inputs

export type ProofInputs = {
  nymCodeMsgHash: string;
  signedNymCode: string; // NOTE: private
  nymHash: string;

  contentDataMsgHash: string;
  signedContentData: string; // NOTE: private

  merkleProof: MerkleProof;
};

// NOTE: NymOwnership prover. extend if we add others
export class Prover {
  async initWasm() {
    await initWasm();
  }

  //  note: i believe we'll need T + U for both signatures!
  async prove({
    nymCodeMsgHash,
    signedNymCode,
    nymHash,

    contentDataMsgHash,
    signedContentData,

    merkleProof,
  }: ProofInputs) {
    // NOTE: re-use names...
    const { r, s, v } = fromSig(signedNymCode);

    const effEcdsaPubInput = computeEffEcdsaPubInput(r, v, nymCodeMsgHash);
    const circuitPubInput = new CircuitPubInput(
      merkleProof.root,
      effEcdsaPubInput.Tx,
      effEcdsaPubInput.Ty,
      effEcdsaPubInput.Ux,
      effEcdsaPubInput.Uy
    );
    const publicInput = new PublicInput(r, v, nymCodeMsgHash, circuitPubInput);

    const witnessGenInput = {
      s,
      ...merkleProof,
      ...effEcdsaPubInput,
    };

    const witness = await snarkJsWitnessGen(
      witnessGenInput,
      this.witnessGenWasm
    );

    const circuitBin = await loadCircuit(this.circuit);

    // Get the public input in bytes
    const circuitPublicInput: Uint8Array =
      publicInput.circuitPubInput.serialize();

    let proof = wasm.prove(circuitBin, witness.data, circuitPublicInput);
  }
}
