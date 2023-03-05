pragma circom 2.1.2;

include "../nym/nym_ownership.circom";

component main { public[ root, Tx, Ty, Ux, Uy, nymCode, nymHash, contentData ]} = NymOwnership(20);