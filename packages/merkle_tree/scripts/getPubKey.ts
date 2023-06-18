import { getPubkey } from "../src/pubkey";
import alchemy from "../src/alchemy";
import { formatHex } from "../src/utils";

const main = async () => {
  const address = process.argv[2];
  if (!address) {
    console.log("Usage: pnpm getPubKey <address>");
    return;
  }

  const currentBlockHeight = await alchemy.core.getBlockNumber();

  const pubkey = await getPubkey(formatHex(address), currentBlockHeight);
  console.log(pubkey?.toString("hex"));
};

main();
