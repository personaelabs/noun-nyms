import { ecrecover, pubToAddress } from "@ethereumjs/util";
import { Transaction, FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import alchemy from "./alchemy";
import axiosBase from "axios";

const es = axiosBase.create({
  baseURL: "https://api.etherscan.io/api"
});

export const getPubkey = async (
  address: string,
  blockHeight: number
): Promise<Buffer | null> => {
  let pubKey;

  try {
    const result = await es.get("/", {
      params: {
        action: "txlist",
        module: "account",
        address: "0x" + address,
        startblock: 0,
        endblock: blockHeight,
        apikey: process.env.ETHERSCAN_API_KEY
      }
    });

    const esTx = result.data.result.find(
      (tx: { from: string; chainId: number }) =>
        tx.from.toLowerCase() === "0x" + address.toLowerCase()
    );

    const tx = await alchemy.core.getTransaction(esTx.hash);

    if (tx) {
      let msgHash;

      if (tx.type === 0) {
        const txData = {
          from: tx.from,
          nonce: tx.nonce,
          gasPrice: tx.gasPrice?.toBigInt(),
          gasLimit: tx.gasLimit?.toBigInt(),
          to: tx.to,
          value: tx.value.toBigInt(),
          accessList: tx.accessList,
          data: tx.data,
          // We need to provide this to be compatible with non EIP-155 transactions
          s: tx.s,
          r: tx.r,
          v: tx.v
        };

        msgHash = Transaction.fromTxData(txData).getMessageToSign(true);
      } else {
        const txData = {
          from: tx.from,
          nonce: tx.nonce,
          maxFeePerGas: tx.maxFeePerGas?.toBigInt(),
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toBigInt(),
          gasLimit: tx.gasLimit?.toBigInt(),
          to: tx.to,
          value: tx.value.toBigInt(),
          accessList: tx.accessList,
          data: tx.data,
          // We need to provide this to be compatible with non EIP-155 transactions
          s: tx.s,
          r: tx.r,
          v: tx.v
        };

        msgHash =
          FeeMarketEIP1559Transaction.fromTxData(txData).getMessageToSign(true);
      }

      const s = Buffer.from(tx.s?.replace("0x", "") as string, "hex");
      const r = Buffer.from(tx.r?.replace("0x", "") as string, "hex");
      const v = BigInt(tx.v as number);

      pubKey = ecrecover(msgHash, v, r, s, BigInt(tx.chainId));
      const expectedAddress = address.replace("0x", "").toLowerCase();
      const recoveredAddress = pubToAddress(pubKey)
        .toString("hex")
        .toLowerCase();
      if (expectedAddress !== recoveredAddress) {
        console.log(
          "error",
          "Failed to get the public key from the address",
          tx.type,
          expectedAddress,
          recoveredAddress
        );
      }
    }
  } catch (err) {
    console.log(
      "error",
      "Failed to get the public key from the address",
      address,
      err
    );
  }

  return pubKey || null;
};
