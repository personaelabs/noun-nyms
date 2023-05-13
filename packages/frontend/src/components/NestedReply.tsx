import { useMemo } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import styled from 'styled-components';
import { ButtonIcon } from './ButtonIcon';
import { IPostWithReplies, IRootPost } from '@/types/api';

interface IReplyProps extends IPostWithReplies {
  depth: number;
  innerReplies: React.ReactNode;
  profileImgURL: string;
  proof: string;
  childrenLength: number;
  createdAt: Date;
}
export const resolveNestedReplyThreads = (allPosts: IPostWithReplies[], depth: number) => {
  const replyNodes: React.ReactNode[] = [];
  const profileImgURL = '';
  const proof = '';
  for (const post of allPosts) {
    replyNodes.push(
      <NestedReply
        {...post}
        key={post.id}
        depth={depth}
        createdAt={new Date(post.timestamp)}
        innerReplies={resolveNestedReplyThreads(post.replies, depth + 1)}
        profileImgURL={profileImgURL}
        proof={proof}
        childrenLength={post.replies.length}
      />,
    );
  }
  return replyNodes;
};

const Container = styled.div``;

export const NestedReply = (replyProps: IReplyProps) => {
  const {
    depth,
    id,
    body,
    createdAt,
    userId,
    innerReplies,
    profileImgURL,
    childrenLength,
    upvotes,
  } = replyProps;
  const dateFromDescription = useMemo(() => {
    const date = dayjs(createdAt);
    // Dayjs doesn't have typings on relative packages so we have to do this
    // @ts-ignore
    return date.fromNow();
  }, [createdAt]);

  return (
    <Container
      key={id}
      style={{
        marginLeft: `${depth * 20}px`,
        borderLeft: '0.5px dotted grey',
        paddingLeft: '10px',
      }}
    >
      <div className="py-2"></div>
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center">
          <Image
            alt={'profile'}
            src={profileImgURL ? profileImgURL : '/anon-noun.png'}
            width={30}
            height={30}
          />
          <div className="px-0.5"></div>
          <p className="font-bold">{userId}</p>
          <div className="px-2"></div>
          <p style={{ color: 'gray' }}>{dateFromDescription}</p>
        </div>
      </div>
      <div className="py-2"></div>
      <span>{body}</span>
      <div className="py-2"></div>
      <div className="w-full" style={{ height: '2px', background: '#EAECF0' }}></div>
      <div className="py-1"></div>
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center">
          <ButtonIcon
            onClick={() => console.log('clicked')}
            iconPath="/upvote.svg"
            bgColor="#D0D5DD"
            hoverBgColor="#0E76FD"
            iconWidth={20}
            iconHeight={20}
            iconText={upvotes.length.toString()}
          />
          <div className="px-1"></div>
        </div>
        <div className="flex justif-center items-center">
          <strong style={{ color: '#47546' }}>{childrenLength}</strong>
          <div className="px-0.5"></div>
          <p style={{ color: 'gray' }}>{'  '}replies</p>
          <div className="px-4"></div>
          <ButtonIcon
            onClick={() => console.log('clicked')}
            iconPath="/reply.svg"
            bgColor="#D0D5DD"
            hoverBgColor="#0E76FD"
            iconWidth={15}
            iconHeight={12.5}
            iconText={'Reply'}
          />
        </div>
      </div>
      <div className="py-2"></div>
      {innerReplies}
    </Container>
  );
};
