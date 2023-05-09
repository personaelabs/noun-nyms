import PostMessage from '@/components/example/PostMessage';
import Upvote from '@/components/example/Upvote';
import ExampleProviders from '@/components/example/Providers';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Example() {
  return (
    <div>temp</div>
    <ExampleProviders>
      <div className="ml-4 mt-4">
        <ConnectButton />
      </div>
      <div className="mt-4">
        <PostMessage />
      </div>
      <div className="mt-4">
        <Upvote />
      </div>
    </ExampleProviders>
  );
}
