import { motion } from 'framer-motion';
import ConnectWallet from './ConnectWallet';

export const Header = () => {
  return (
    <div className="bg-black dots w-full">
      <div className="pt-8">
        <nav className="pr-6 flex justify-end">
          <ConnectWallet />
        </nav>
        <div className="max-w-7xl mx-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-center max-w-2xl mx-auto">
            <motion.h1
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="leading-[40px] md:leading-14"
            >
              Give Feedback On Proposals Anonymously
            </motion.h1>
            <motion.h4
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-4 md:leading-8 font-normal text-white"
            >
              Anoun allows noun-holders to give feedback on proposals while maintaining their
              privacy using zero-knowledge proofs.{' '}
            </motion.h4>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-40" src="/nouns.png" alt="nouns" />
      </div>
    </div>
  );
};