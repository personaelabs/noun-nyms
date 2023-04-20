const snarkjs = require("snarkjs");

import { NymProof, NymProofInput } from "../../types/nym_prover";
import wasm, { init } from "../../wasm";
import { Profiler } from "./profiler";
import { bigIntToBytes } from "../utils";

// NOTE: we'll subsidize storage of these files for now
export const CIRCUIT_URL = "";
export const WITNESS_GEN_WASM_URL = "";

export type ProverConfig = {
  enableProfiler?: boolean;
};

export class NymProver extends Profiler {
  circuit: string;
  witnessGenWasm: string;

  constructor(options: ProverConfig) {
    super({ enabled: options?.enableProfiler });

    // TODO: pull in witness gen wasm and circuit files from google storage (time this)
    this.circuit = "";
    this.witnessGenWasm = "";
  }

  async initWasm() {
    this.time("init wasm");
    await init();
    this.timeEnd("init wasm");
  }

  // NOTE: return information for verification
  async prove(input: NymProofInput): Promise<NymProof> {
    this.time("generate witness");
    const witnessInput = {}; // TODO: populate it from NymProofInput
    const witness: {
      type: string;
      data?: any;
    } = {
      type: "mem",
    };
    await snarkjs.wtns.calculate(witnessInput, this.witnessGenWasm, witness);
    this.timeEnd("generate witness");

    this.time("load circuit");
    const response = await fetch(CIRCUIT_URL);
    const circuit = await response.arrayBuffer();
    const circuitBin = new Uint8Array(circuit);
    this.timeEnd("load circuit");

    const circuitPubInput = Uint8Array.from([]); // TODO: populate it

    this.time("prove");
    const proof = wasm.prove(circuitBin, witness.data, circuitPubInput);
    this.timeEnd("prove");

    return {
      proof,
      serializedPublicInput: circuitPubInput,
    };
  }
}
