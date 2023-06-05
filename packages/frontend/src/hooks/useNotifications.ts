import axios from 'axios';
import { useEffect, useState } from 'react';
import { INotificationFeed } from '@/types/api';
import { NotificationType } from '@/types/components';
import { Notification } from '@/types/components';
import useUserInfo from './useUserInfo';
import { useAccount, usePublicClient } from 'wagmi';
import { getUserNameFromId } from '@/lib/user-utils';
import { PublicClient } from 'viem';

const getNotificationsInLocalStorage = (address: string): Notification[] => {
  const notifications = localStorage.getItem(`notifications-${address}`);
  if (notifications) {
    return JSON.parse(notifications) as Notification[];
  }
  return [];
};

const trimAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const trimText = (text: string) => {
  if (text.length < 50) {
    return text;
  }
  return `${text.slice(0, 50)}...`;
};

const mapUserIdsToNames = async (
  publicClient: PublicClient,
  userIds: string[],
): Promise<{ [key: string]: string }> => {
  const mapping: { [key: string]: string } = {};
  const names = await Promise.all(
    userIds.map(async (userId) => {
      const userName = await getUserNameFromId(publicClient, userId);
      if (userName.isDoxed) {
        return trimAddress(userName.name);
      }
      return userName.name;
    }),
  );

  for (let i = 0; i < names.length; i++) {
    mapping[userIds[i]] = names[i];
  }

  return mapping;
};

const useNotifications = () => {
  const { address } = useAccount();
  const { nymOptions } = useUserInfo({ address });
  const [notifications, setNotifications] = useState<Notification[]>();
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (notifications) {
      setIsLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    if (!address || !nymOptions) {
      return;
    }

    (async () => {
      const userIds = nymOptions
        .map((nym) => `${nym.name}-${nym.nymHash}`)
        .concat(address.toLowerCase());

      console.time('fetch notification feed');
      const result = await axios.get<INotificationFeed[]>('/api/v1/notification-feed');
      console.timeEnd('fetch notification feed');
      const feed = result.data;

      console.log('feed', feed);
      const feedInLocalStorage = getNotificationsInLocalStorage(address);

      // Get the reply ids stored in local storage
      const replyIdsInLocalStorage = feedInLocalStorage
        .filter((notification) => notification.type === NotificationType.DirectReply)
        .map((reply) => reply.id);

      // Get the upvote ids stored in local storage
      const upvoteIdsInLocalStorage = feedInLocalStorage
        .filter((notification) => notification.type === NotificationType.Upvote)
        .map((upvote) => upvote.id);

      console.time('extract new notifications');
      // Get the posts the user has made.
      const userPosts = feed.filter((post) => userIds.includes(post.userId));
      const userPostIds = userPosts.map((post) => post.id);

      // Get all root posts that the user has made.
      const rootPosts = userPosts.filter((post) => !post.parentId);

      // Get all children of the root posts that the user has made.
      const rootPostIds = rootPosts.map((post) => post.id);
      const rootPostReplies = feed.filter((post) => rootPostIds.includes(post.rootId || ''));

      // Get all the direct children of the posts the user has made.
      // We will show notifications for those.
      const directReplies = feed.filter((post) => userPostIds.includes(post.parentId || ''));
      const newDirectReplies = directReplies.filter(
        (reply) => !replyIdsInLocalStorage.includes(reply.id),
      );

      const newUpvotes = userPosts.flatMap((post) =>
        post.upvotes.filter((upvote) => !upvoteIdsInLocalStorage.includes(upvote.id)),
      );

      const uniqueUserIds = Array.from(
        new Set([
          ...newDirectReplies.map((reply) => reply.userId),
          ...newUpvotes.map((upvote) => upvote.address),
        ]),
      );

      console.time('map user ids to names');
      const userIdsToNames = await mapUserIdsToNames(publicClient, uniqueUserIds);
      console.timeEnd('map user ids to names');

      const newNotifications: Notification[] = [];

      // Append all the new direct replies to `newNotifications`
      for (let i = 0; i < newDirectReplies.length; i++) {
        const reply = newDirectReplies[i];
        newNotifications.push({
          id: reply.id,
          postId: reply.parentId as string,
          // If the upvoted post is a root post, use its title.
          // Otherwise, use the body.
          postText: trimText(reply.parent?.title || reply.parent?.body || ''),
          replyText: trimText(reply.body),
          userName: userIdsToNames[reply.userId],
          userId: reply.userId,
          type: NotificationType.DirectReply,
          read: false,
          timestamp: new Date(reply.timestamp),
        });
      }

      // Append all the new root post replies to `newNotifications`
      for (let i = 0; i < rootPostReplies.length; i++) {
        const reply = rootPostReplies[i];
        newNotifications.push({
          id: reply.id,
          postId: reply.rootId as string,
          postText: reply.root?.title || '',
          replyText: trimText(reply.body),
          userName: userIdsToNames[reply.userId],
          userId: reply.userId,
          type: NotificationType.DiscussionReply,
          read: false,
          timestamp: new Date(reply.timestamp),
        });
      }

      // Append all the new upvotes to `newNotifications`
      for (let i = 0; i < userPosts.length; i++) {
        const post = userPosts[i];
        const newUpvotes = post.upvotes.filter(
          (upvote) => !upvoteIdsInLocalStorage.includes(upvote.id),
        );
        newNotifications.push(
          ...newUpvotes.map((upvote) => ({
            id: upvote.id,
            postId: post.id,
            // If the upvoted post is a root post, use its title.
            // Otherwise, use the body.
            postText: trimText(post.title || post.body),
            userName: userIdsToNames[upvote.address],
            userId: upvote.address,
            type: NotificationType.Upvote,
            read: false,
            timestamp: new Date(upvote.timestamp),
          })),
        );
      }

      console.log('newNotifications', newNotifications);

      const sortedNotifications = newNotifications.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );

      console.timeEnd('extract new notifications');

      // TODO: Update the notifications in local storage

      setNotifications([...sortedNotifications, ...feedInLocalStorage]);
    })();
  }, [address, nymOptions, publicClient]);

  return { notifications, isLoading };
};

export default useNotifications;
