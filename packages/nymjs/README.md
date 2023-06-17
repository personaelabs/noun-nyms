# nymjs

A simple lib for zk-pseudonyms.

## Usage

### proving
```js
import { NymProver } from '@personaelabs/nymjs';

const prover = new NymProver({
  // additional prover options: https://github.com/personaelabs/nym/blob/main/packages/nymjs/src/core/prover.ts#L27
  enableProfiler: true,
});

await prover.loadCircuit();
await prover.initWasm();

const proof = await nymProver.prove(
  nymName, // nym to use
  content, // content to sign
  nymSig,  // signature of nym by ecdsa signer
  contentSig, // signature of content by ecdsa signer
  merkleProof, // merkle branch for set membership
);
```

### verifying
```js
import { NymVerifier } from '@personaelabs/nymjs';

const verifier = new NymVerifier({
  circuitBin: Buffer.from(JSON.parse(circuitJson.toString()).circuit, 'hex'),
  enableProfiler: true,
});

await verifier.initWasm();

const proofVerified: boolean = await verifier.verify(
  post // data of type Post https://github.com/personaelabs/nym/blob/main/packages/nymjs/src/types.ts#L12
);
```