import * as wasm from './wasm';

export const init = async () => {
  const wasmBytes = (await import('@personaelabs/spartan-ecdsa/build/wasm/wasm_bytes')).wasmBytes;
  await wasm.initSync(wasmBytes.buffer);
  wasm.init_panic_hook();
};

export default wasm;
