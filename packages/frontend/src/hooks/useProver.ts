import { useMemo, useEffect } from 'react';
import { NymProver, ProverConfig } from '@personaelabs/nymjs';

const useProver = (proverConfig?: ProverConfig) => {
  const prover = useMemo(() => new NymProver(proverConfig || {}), [proverConfig]);

  // Fetch the circuit and initialize the WASM
  // as soon as the page renders to improve perceived proving speed
  useEffect(() => {
    (async () => {
      await prover.loadCircuit();
      await prover.initWasm();
    })();
  }, [prover]);

  return prover;
};

export default useProver;
