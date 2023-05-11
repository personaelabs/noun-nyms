ALTER TABLE public. "Post"
ADD CONSTRAINT "id_missing_hex_prefix" CHECK ("id" ~ '^0x.*'),
ADD CONSTRAINT "userId_missing_hex_prefix" CHECK ("userId" ~ '^0x.*' OR "attestationScheme" = 'Nym'),
ADD CONSTRAINT "attestation_missing_hex_prefix" CHECK ("attestation" ~ '^0x.*');

ALTER TABLE public. "DoxedUpvote"
ADD CONSTRAINT "address_missing_hex_prefix" CHECK ("address" ~ '^0x.*'),
ADD CONSTRAINT "sig_missing_hex_prefix" CHECK ("sig" ~ '^0x.*');


ALTER TABLE public. "Tree"
ADD CONSTRAINT "treeRoot_missing_hex_prefix" CHECK ("root" ~ '^0x.*');



ALTER TABLE public. "TreeNode"
ADD CONSTRAINT "pubkey_missing_hex_prefix" CHECK ("pubkey" ~ '^0x.*');

