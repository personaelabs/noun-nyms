import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API key.
  network: Network.ETH_MAINNET // Replace with your network.
};

const alchemy = new Alchemy(settings);
export default alchemy;
