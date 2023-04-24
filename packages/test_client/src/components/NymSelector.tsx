import { useState } from 'react';
import { useSignMessage } from 'wagmi';
import { computeNymHash } from '@personaelabs/nymjs';

type Props = {
  onNymSelected: (nymCode: string, signedNymCode: string, nymHash: string) => void;
};

export default function NymSelector({ onNymSelected }: Props) {
  const [nymCode, setNymCode] = useState('');

  const { signMessageAsync } = useSignMessage({
    message: nymCode,
  });

  const createNym = async () => {
    const signedNymCode = await signMessageAsync();
    const nymHash = await computeNymHash(signedNymCode);

    // TODO: this should probably be handled with component state
    const nymCodeInput = document.getElementById('nymCodeInput') as HTMLInputElement;
    nymCodeInput.readOnly = true;

    onNymSelected(nymCode, signedNymCode, nymHash);
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
