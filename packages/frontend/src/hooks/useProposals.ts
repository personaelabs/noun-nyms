import axios from 'axios';
import { useEffect, useState } from 'react';

export interface RawProposal {
  id: string;
  description: string;
  status: string;
}

export interface PropQueryResponse {
  data: { proposals: RawProposal[] };
}

export interface Proposal {
  id: string;
  status: string;
  title: string;
}

const cleanProposal = (proposal: RawProposal): Proposal => {
  const regex = /^#\s+(.*)$/m;
  const match = regex.exec(proposal.description);

  let title = '';
  if (match && match[1]) {
    title = match[1];
  }
  const prop: Proposal = {
    id: proposal.id,
    status: proposal.status,
    title,
  };
  return prop;
};

async function fetchData() {
  const url = 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph';
  const query = `
    {
      proposals(orderBy: startBlock, orderDirection: desc, first: 1000) {
        id
        description
        status
      }
    }
  `;

  try {
    const response = await axios.post<PropQueryResponse>(
      url,
      { query },
      { headers: { 'Content-Type': 'application/json' } },
    );
    return response.data.data.proposals;
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchData();

const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>();
  useEffect(() => {
    const getProps = async () => {
      const fetchedProposals = await fetchData();
      if (fetchedProposals) {
        const clean = fetchedProposals.map((f) => cleanProposal(f));
        setProposals(clean);
      }
    };

    getProps();
  }, []);

  return { proposals };
};

export default useProposals;
