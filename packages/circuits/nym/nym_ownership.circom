pragma circom 2.1.2;

include "../spartan_ecdsa/eff_ecdsa.circom";
include "../spartan_ecdsa/tree.circom";
include "../poseidon/poseidon.circom";

/**
 *  NymOwnership (pubkey)
 *  ================
 *  
 *  Implements the scheme defined here: https://ethresear.ch/t/a-simple-persistent-pseudonym-scheme/14930
 *  
 *  Pubkey membership in merkle root (not address) 
 */
template NymOwnership(treeLevels) {
    signal input Tx; 
    signal input Ty; 
    signal input Ux;
    signal input Uy;

    signal input nymCode;
    signal input signedNymCode; // NOTE: 's' in efficient-ecdsa
    signal input nymHash; 

    signal input root;
    signal input pathIndices[treeLevels];
    signal input siblings[treeLevels];

    signal input contentData;
    signal input signedContentData; // NOTE: 's' in efficient-ecdsa

    // nym sig check 
    component nymSigVerify = EfficientECDSA();
    nymSigVerify.Tx <== Tx;
    nymSigVerify.Ty <== Ty;
    nymSigVerify.Ux <== Ux;
    nymSigVerify.Uy <== Uy;
    nymSigVerify.s <== signedNymCode;

    // nym hash check (double input poseidon, so uses signedNymCode as both inputs)
    // TODO: change upstream poseidon to have variable input
    component nymHashCheck = Poseidon();
    nymHashCheck.inputs[0] <== signedNymCode;
    nymHashCheck.inputs[1] <== signedNymCode;
    nymHashCheck.out === nymHash;

    // content data sig check
    component contentSigVerify = EfficientECDSA();
    contentSigVerify.Tx <== Tx;
    contentSigVerify.Ty <== Ty;
    contentSigVerify.Ux <== Ux;
    contentSigVerify.Uy <== Uy;
    contentSigVerify.s <== signedContentData;

    // merkle root check
    component pubKeyHash = Poseidon();
    pubKeyHash.inputs[0] <== nymSigVerify.pubKeyX;
    pubKeyHash.inputs[1] <== nymSigVerify.pubKeyY;
    pubKeyHash.inputs[0] === contentSigVerify.pubKeyX;
    pubKeyHash.inputs[1] === contentSigVerify.pubKeyY;

    component merkleProof = MerkleTreeInclusionProof(treeLevels);
    merkleProof.leaf <== pubKeyHash.out;
    for (var i = 0; i < treeLevels; i++) {
        merkleProof.pathIndices[i] <== pathIndices[i];
        merkleProof.siblings[i] <== siblings[i];
    }
    root === merkleProof.root;
}