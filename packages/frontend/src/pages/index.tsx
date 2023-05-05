import { motion } from 'framer-motion';
import { CommentView } from '../components/MessageRow';
import { TEMP_DUMMY_DATA } from '../lib/constants';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getPosts = async () => (await axios.get('/api/v1/posts')).data;
const getPostById = async () =>
  await axios.get(
    `/api/v1/posts/0x0a2628013a565e6f5c14acd5c4119cf2b7a57234656e59e328fd88a57c51c8a7`,
  );

export default function Home() {
  // TODO: Add types
  const { isLoading: propIdsLoading, data } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    retry: 1,
    enabled: true,
    staleTime: 1000,
  });

  const { isLoading, data: singlePost } = useQuery({
    queryKey: ['post'],
    queryFn: getPostById,
    retry: 1,
    enabled: true,
    staleTime: 1000,
  });

  console.log(`posts`, data);
  console.log(`single post`, singlePost);
  return (
    <main className="flex w-full flex-col justify-center items-center">
      <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-black dots w-full">
          <div className="pt-8">
            <nav className="pr-6 flex justify-end"></nav>
            <div className="max-w-7xl mx-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="text-center md:text-center max-w-2xl mx-auto">
                <motion.h1
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl md:text-5xl text-white font-bold leading-[40px] md:leading-14"
                >
                  Give Feedback On Proposals Anonymously
                </motion.h1>
                <motion.p
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-4 text-lg md:text-xl font-normal md:leading-8 text-white"
                >
                  Anoun allows noun-holders to give feedback on proposals while maintaining their
                  privacy using zero-knowledge proofs.{' '}
                </motion.p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-40" src="nouns.png" alt="nouns" />
          </div>
        </div>
        <div className="py-8"></div>

        <div className="bg-gray-50 min-h-screen w-full">
          <div className="max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
            <div className="flex space-x-2"></div>
            <div className="mt-6">
              {TEMP_DUMMY_DATA.map((el) => (
                <React.Fragment key={el.commentId}>
                  <CommentView key={el.commentId} {...el} />
                  <div className="py-8"></div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
