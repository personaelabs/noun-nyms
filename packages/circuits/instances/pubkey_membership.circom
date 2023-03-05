pragma circom 2.1.2;

include "../spartan_ecdsa/pubkey_membership.circom";

component main { public[ root, Tx, Ty, Ux, Uy ]} = PubKeyMembership(20);