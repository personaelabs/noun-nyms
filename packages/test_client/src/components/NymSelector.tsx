import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import { computeNymHash, NYM_CODE_TYPE, DOMAIN, EIP712TypedData } from '@personaelabs/nymjs';

type Props = {
  onNymSelected: (nymName: EIP712TypedData, signedNymName: string, nymHash: string) => void;
};

export default function NymSelector({ onNymSelected }: Props) {
  const [nymName, setnymName] = useState('');

  const { signTypedDataAsync } = useSignTypedData();

  const createNym = async () => {
    const typedNymName = {
      domain: DOMAIN,
      types: NYM_CODE_TYPE,
      value: {
        nymName,
      },
    };
    const signedNymName = await signTypedDataAsync(typedNymName);
    const nymHash = await computeNymHash(signedNymName);

    // TODO: this should probably be handled with component state
    const nymNameInput = document.getElementById('nymNameInput') as HTMLInputElement;
    nymNameInput.readOnly = true;

    onNymSelected(typedNymName, signedNymName, nymHash);
  };

  return (
    <div>
      <input
        type="text"
        id="nymNameInput"
        value={nymName}
        onChange={(e) => setnymName(e.target.value)}
      />

      <button onClick={() => createNym()}>select nym</button>
    </div>
  );
}
