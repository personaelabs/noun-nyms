const snarkjs = require("snarkjs");

import { NymInput, Proof, ProverConfig } from "../types";

import wasm, { init } from "../wasm";

// A helper class to optionally run console.time/console.timeEnd
// taken from https://github.com/personaelabs/spartan-ecdsa/blob/main/packages/lib/src/helpers/profiler.ts
class Profiler {
  private enabled: boolean;

  constructor(options: { enabled?: boolean }) {
    this.enabled = options.enabled || false;
  }

  time(label: string) {
    this.enabled && console.time(label);
  }

  timeEnd(label: string) {
    this.enabled && console.timeEnd(label);
  }
}

// NOTE: we'll subsidize storage of these files for now
export const CIRCUIT_URL = "";
export const WITNESS_GEN_WASM_URL = "";

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

  async prove(input: NymInput): Promise<Proof> {
    this.time("generate witness");
    const witnessInput = {}; // TODO: populate it from NymInput
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
      proof: Uint8Array.from([]),
      publicInput: {},
    };
  }
}
