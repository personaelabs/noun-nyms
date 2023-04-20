import { ecrecover, pubToAddress } from "@ethereumjs/util";
import {
  Transaction,
  FeeMarketEIP1559Transaction,
  AccessListEIP2930Transaction
} from "@ethereumjs/tx";
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

    if (!esTx) {
      console.log("No outgoing tx found for address", address);
    } else {
      const tx = await alchemy.core.getTransaction(esTx.hash);
      if (tx) {
        let msgHash;
        if (tx.type === 0) {
          // Legacy and EIP-155 Transaction
          const txData = {
            nonce: tx.nonce,
            gasPrice: tx.gasPrice?.toBigInt(),
            gasLimit: tx.gasLimit?.toBigInt(),
            to: tx.to,
            value: tx.value.toBigInt(),
            data: tx.data,

            // Need to pass these so Transaction.fromTxData can detect
            // the correct transaction type
            v: tx.v,
            r: tx.r,
            s: tx.s,
            type: tx.type
          };

          msgHash = Transaction.fromTxData(txData).getMessageToSign(true);
        } else if (tx.type === 1) {
          // EIP-2930 Transaction (access lists)
          const txData = {
            nonce: tx.nonce,
            gasPrice: tx.gasPrice?.toBigInt(),
            gasLimit: tx.gasLimit?.toBigInt(),
            to: tx.to,
            value: tx.value.toBigInt(),
            accessList: tx.accessList,
            data: tx.data
          };

          msgHash =
            AccessListEIP2930Transaction.fromTxData(txData).getMessageToSign(
              true
            );
        } else if (tx.type === 2) {
          // EIP-1559 Transaction
          const txData = {
            nonce: tx.nonce,
            maxFeePerGas: tx.maxFeePerGas?.toBigInt(),
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toBigInt(),
            gasLimit: tx.gasLimit?.toBigInt(),
            to: tx.to,
            value: tx.value.toBigInt(),
            accessList: tx.accessList,
            data: tx.data
          };

          msgHash =
            FeeMarketEIP1559Transaction.fromTxData(txData).getMessageToSign(
              true
            );
        } else {
          console.error("Unknown tx type", tx.type);
          return null;
        }

        // Recover the public key
        const s = Buffer.from(tx.s?.replace("0x", "") as string, "hex");
        const r = Buffer.from(tx.r?.replace("0x", "") as string, "hex");
        const v = BigInt(tx.v as number);

        const chainId = tx.chainId === 0 ? undefined : BigInt(tx.chainId);
        pubKey = ecrecover(msgHash, v, r, s, chainId);

        // Check that the recovered public key hashes the address
        const expectedAddress = address.replace("0x", "").toLowerCase();
        const recoveredAddress = pubToAddress(pubKey)
          .toString("hex")
          .toLowerCase();
        if (expectedAddress !== recoveredAddress) {
          console.error(
            "Failed to get the public key from the address",
            tx.type,
            expectedAddress,
            recoveredAddress
          );
        }
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
