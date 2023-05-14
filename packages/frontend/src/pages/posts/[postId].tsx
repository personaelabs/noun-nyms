import { motion } from 'framer-motion';
import { Post } from '@/components/post/Post';
import { Fragment } from 'react';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IPost } from '@/types/api';
import { useRouter } from 'next/router';
import Posts from '..';

export default function PostId() {
  const router = useRouter();
  //TODO: is this good practice?
  const openPostId = router.query.postId as string;
  console.log({ openPostId });
  return <Posts openPostId={openPostId} />;
}
