import alchemy from "./alchemy";
import * as ethers from "ethers";

const SAFE_GET_OWNERS_ABI = [
  "function getOwners() public view returns (address[] memory)"
];

export const getOwners = async (multisigAddress: string): Promise<string[]> => {
  const iface = new ethers.Interface(SAFE_GET_OWNERS_ABI);
  const data = iface.encodeFunctionData("getOwners", []);

  let owners;
  try {
    const result = await alchemy.core.call({
      to: multisigAddress,
      data
    });
    owners = iface.decodeFunctionResult("getOwners", result)[0];
  } catch (err) {
    console.log(err);
  }

  if (!owners) {
    return [];
  } else {
    return owners.map((owner: string) => owner.replace("0x", "").toLowerCase());
  }
};
