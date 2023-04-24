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
 *  Pubkey membership in merkle root (not address) + nym ownership + content data commitment 
 */
template NymOwnership(treeLevels) {
    // public nym signature efficient-ecdsa artifacts 
    // note that U encodes msghash (= r^(-1)m * G ), thus relationship b/w nymSigU{x,y} and nym is publicly verifiable
    // same holds for contentSig inputs below
    signal input nymSigTx;
    signal input nymSigTy;
    signal input nymSigUx;
    signal input nymSigUy;

    // private nym signature efficient-ecdsa artifact
    signal input nymSigS; 

    // nymHash = poseidon('s' part of ECDSASig(nym))
    signal input nymHash; 
        
    // same relationship with `content` as `nymSig` inputs have with `nym` above
    signal input contentSigTx;
    signal input contentSigTy;
    signal input contentSigUx;
    signal input contentSigUy;

    // private content signature efficient-ecdsa artifact
    signal input contentSigS; 

    // merkle proof for membership check 
    signal input root;
    signal input pathIndices[treeLevels];
    signal input siblings[treeLevels];

    // nym sig check 
    component nymSigVerify = EfficientECDSA();
    nymSigVerify.Tx <== nymSigTx;
    nymSigVerify.Ty <== nymSigTy;
    nymSigVerify.Ux <== nymSigUx;
    nymSigVerify.Uy <== nymSigUy;
    nymSigVerify.s <== nymSigS;

    // content data sig check
    component contentSigVerify = EfficientECDSA();
    contentSigVerify.Tx <== contentSigTx;
    contentSigVerify.Ty <== contentSigTy;
    contentSigVerify.Ux <== contentSigUx;
    contentSigVerify.Uy <== contentSigUy;
    contentSigVerify.s <== contentSigS;

    // nym hash check (double input poseidon, so uses signedNymCode as both inputs)
    component nymHashCheck = Poseidon();
    nymHashCheck.inputs[0] <== nymSigS;
    nymHashCheck.inputs[1] <== nymSigS;
    nymHashCheck.out === nymHash;

    // merkle root check
    component pubKeyHash = Poseidon();
    pubKeyHash.inputs[0] <== nymSigVerify.pubKeyX;
    pubKeyHash.inputs[1] <== nymSigVerify.pubKeyY;

    // TODO: Fix this
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