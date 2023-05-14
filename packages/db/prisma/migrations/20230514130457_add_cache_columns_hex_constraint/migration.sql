ALTER TABLE public. "CachedEOA"
ADD CONSTRAINT "address_missing_hex_prefix" CHECK ("address" ~ '^0x.*');

ALTER TABLE public. "CachedEOA"
ADD CONSTRAINT "pubkey_missing_hex_prefix" CHECK ("pubkey" ~ '^0x.*');


ALTER TABLE public. "CachedCode"
ADD CONSTRAINT "address_missing_hex_prefix" CHECK ("address" ~ '^0x.*');

ALTER TABLE public. "CachedCode"
ADD CONSTRAINT "code_missing_hex_prefix" CHECK ("code" ~ '^0x.*');

