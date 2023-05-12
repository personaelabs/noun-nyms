import axiosBase from 'axios';
import { PrefixedHex } from '@personaelabs/nymjs';

export const axios = axiosBase.create({
  baseURL: `http://localhost:3000/api/v1`,
});

type Member = {
  pubkey: string;
  path: string[];
  indices: number[];
};

export const getLatestGroup = async () => {
  const { data } = await axios.get('/groups/latest?set=1');

  const group: {
    root: PrefixedHex;
    members: Member[];
  } = data;

  return group;
};
