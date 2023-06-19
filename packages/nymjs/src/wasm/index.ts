import * as wasm from './wasm';

export const init = async () => {
  await wasm.initSync();
  wasm.init_panic_hook();
};

export default wasm;
