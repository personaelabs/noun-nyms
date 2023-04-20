export const bigIntToBytes = (n: bigint, size: number): Uint8Array => {
  const hex = n.toString(16);
  const hexPadded = hex.padStart(size * 2, "0");
  return Buffer.from(hexPadded, "hex");
};

export function bufferToBigInt(buf: Buffer): bigint {
  return BigInt("0x" + buf.toString("hex"));
}
