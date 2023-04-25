import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import {
  computeNymHash,
  eip712MsgHash,
  NYM_CODE_TYPE,
  DOMAIN,
  EIP712TypedValue,
} from '@personaelabs/nymjs';

type Props = {
  onNymSelected: (nymCode: EIP712TypedValue, signedNymCode: string, nymHash: string) => void;
};

export default function NymSelector({ onNymSelected }: Props) {
  const [nymCode, setNymCode] = useState('');

  const { signTypedDataAsync } = useSignTypedData();

  const createNym = async () => {
    const typedNymCode = {
      domain: DOMAIN,
      types: NYM_CODE_TYPE,
      value: {
        nymCode,
      },
    };
    const signedNymCode = await signTypedDataAsync(typedNymCode);
    const nymHash = await computeNymHash(signedNymCode);

    // TODO: this should probably be handled with component state
    const nymCodeInput = document.getElementById('nymCodeInput') as HTMLInputElement;
    nymCodeInput.readOnly = true;

    onNymSelected(typedNymCode, signedNymCode, nymHash);
  };

  return (
    <div>
      <input
        type="text"
        id="nymCodeInput"
        value={nymCode}
        onChange={(e) => setNymCode(e.target.value)}
      />

      <button onClick={() => createNym()}>select nym</button>
    </div>
  );
}
