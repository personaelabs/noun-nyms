import { FormattedHex } from "./types";

// Format address in any form to 0x-prefixed lowercase hex
export const formatHex = (hex: string): FormattedHex =>
  `0x${hex.toLowerCase().replace(/^0x/, "")}`;
