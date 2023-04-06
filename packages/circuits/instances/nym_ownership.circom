pragma circom 2.1.2;

include "../nym/nym_ownership.circom";

component main { public[ root, nym, nymSigTx, nymSigTy, nymSigUx, nymSigUy, nymHash, content, contentSigTx, contentSigTy, contentSigUx, contentSigUy ]} = NymOwnership(20);