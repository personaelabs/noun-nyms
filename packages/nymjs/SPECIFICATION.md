# Nym data model specification

## Scope and motivation

- Posts and upvotes must be verifiable.[^1]
- Posts and upvotes must have a unique and deterministic identifier.

## Specification

_Inspired by [Farcaster Specifications](https://github.com/farcasterxyz/protocol/blob/main/docs/SPECIFICATION.md#farcaster-specifications)_

## `Content` and `Upvote`

We define two objects `Content` and `Upvote`

`Content`

- `id`: 32 bytes prefixed-hex string computed as described below
- `ContentMessage`:
  - `venue`: string
  - `title`: string
  - `body`: string
  - `groupRoot`: Merkle root of the group
  - `timestamp`: UNIX timestamp
- `attestation`: attestation generated by the `attestationScheme`. An attestation is a byte string, which encoding format depends on the `attestationScheme`.
- `attestationScheme`: (number-assigned enum)
  - 1: `EIP712`
  - 2: `Nym`
- `hashScheme`: (number-assigned enum)
  - 1: `Keccak256` [^2]

`Upvote`

- `id`: 32 bytes prefixed-hex string computed as described below
- `contentId`: `id` of the upvoted `content`
- `groupRoot`: Merkle root of the group
- `timestamp`: UNIX timestamp
- `attestation`: attention generated by the `attestationScheme`
- `attestationScheme`: (number-assigned enum)
  - 1: `EIP712`
- `hashScheme`: (number-assigned enum)
  - 1: `Keccak256`

## Encoding of `attestation`

The format of `attestation` depends on the `attestationScheme`.

### If `attestationScheme = Nym`

`attestation` is a concatenation of the following bytes

- `proof`: Proof in bytes
- `publicInput`: Public input which consists of the following. All fields are padded to equal 32 bytes.
  - `root`
  - `nymSigTx`
  - `nymSigTy`
  - `nymSigUx`
  - `nymSigUy`
  - `nymHash`
  - `contentSigTx`
  - `contentSigTy`
  - `contentSigUx`
  - `contentSigUy`
- `auxiliary`: Auxiliary information which consists of the following. All fields are padded to equal 32 bytes.
  - `nymSigR`
  - `nymSigV`
  - `contentSigR`
  - `contentSigV`
- `nymCode`: UTF-8 encoded Nym code, padded to equal 32 bytes.

### If `attestationScheme = EIP712`

- `attestation` is an [ERC-2098](https://eips.ethereum.org/EIPS/eip-2098) encoded signature

## 3. EIP712

The following EIP712 domain and types MUST be used when signing an EIP712 signature.

`domain`

```json
{
  "name": "nym",
  "version": "1",
  "chainId": 1,
  "verifyingContract": "0x0000000000000000000000000000000000000000",
  "salt": "0x1f62937a3189e37c79aea1c4a1fcd5a56395069b1f973cc4d2218c3b65a6c9ff"
}
```

`types`

**EIP712 types for signing `nymCode`**

```json
{
  "Nym": [{ "name": "nymCode", "type": "string" }]
}
```

**EIP712 types for signing `contentMessage`**

```json
{
  "Post": [
    { "name": "venue", "type": "string" },
    { "name": "title", "type": "string" },
    { "name": "body", "type": "string" },
    { "name": "parentId", "type": "string" },
    { "name": "groupRoot", "type": "string" },
    { "name": "timestamp", "type": "uint256" }
  ]
}
```

**EIP712 types for signing an upvote**

```json
{
  "Post": [
    { "name": "contentId", "type": "string" },
    { "name": "groupRoot", "type": "string" },
    { "name": "timestamp", "type": "uint256" }
  ]
}
```

## Deriving `id` of `Content` and `Upvote`

- `Content`
  - `id = keccak256(venue | title | body | parentId | groupRoot | timestamp | attestation)`
- `Upvote`
  - `id = keccak256(contentId | groupRoot | timestamp | attestation)`

where

- all strings are UTF-8 encoded
- `|` denotes the concatenation of bytes
- `||` denotes OR

## Footnotes

[^1]: This doc only specifies the formats of the minimal set of data required for verification. It doesn’t consider data for _assisting_ verification that is computable by anyone, such as Merkle proofs and the auxiliary of Ethereum state verification.
[^2]: `Keccak256` is adopted for the `hashScheme` because 1. is supported on the EVM. 2. it is faster than Poseidon and 3. have a better set of libraries that are more tractable than existing Poseidon libraries.