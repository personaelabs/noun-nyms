import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { pubToAddress } from '@ethereumjs/util';
import { PrefixedHex, recoverUpvotePubkey, toUpvote } from '@personaelabs/nymjs';
import { verifyInclusion } from '../../utils';

// Handle non-pseudonymous upvotes
// Verify the ECDSA signature and save the upvote
const handleUpvote = async (req: NextApiRequest, res: NextApiResponse<{} | { error: string }>) => {
  const postId = req.query.postId as PrefixedHex;
  const timestamp = req.body.timestamp;
  const sig = req.body.sig;
  const groupRoot = req.body.groupRoot;

  const upvote = toUpvote(postId, groupRoot, timestamp, sig);

  let pubKey;
  try {
    pubKey = recoverUpvotePubkey(upvote);
  } catch (_err) {
    res.status(400).send({ error: 'Invalid signature!' });
    return;
  }

  if (!(await verifyInclusion(pubKey))) {
    res.status(400).send({ error: 'Public key not in latest group' });
    return;
  }

  const address = `0x${pubToAddress(Buffer.from(pubKey.replace('0x', ''), 'hex')).toString('hex')}`;

  await prisma.doxedUpvote.create({
    data: {
      id: upvote.id,
      sig,
      timestamp: new Date(timestamp * 1000),
      postId: upvote.postId,
      address,
      groupRoot: upvote.groupRoot as string,
    },
  });

  res.send(200);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == 'POST') {
    await handleUpvote(req, res);
  } else {
    res.status(400).send('Unsupported method');
  }
}
