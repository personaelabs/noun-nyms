pragma circom 2.1.2;

include "../nym/nym_ownership.circom";

// private: [nymSigS, contentSigS, pathIndices[20], siblings[20]]
component main { public[ root, nymSigTx, nymSigTy, nymSigUx, nymSigUy, nymHash, contentSigTx, contentSigTy, contentSigUx, contentSigUy ]} = NymOwnership(20);