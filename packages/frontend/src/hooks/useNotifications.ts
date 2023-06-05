import axios from 'axios';
import { useEffect, useState } from 'react';
import { IPostPreview } from '@/types/api';
import { NotificationType } from '@/types/components';
import { Notification, MyNotification } from '@/types/components';
import useUserInfo from './useUserInfo';
import { useAccount } from 'wagmi';
import { getUserIdFromName } from '@/lib/example-utils';

interface NotificationMap {
  [id: string]: MyNotification;
}

const notificationsListToMap = (notifications: MyNotification[]) => {
  const map = notifications.reduce((result: NotificationMap, obj) => {
    result[obj.id] = obj;
    return result;
  }, {});
  return map;
};

const notificationsMapToOrderedList = (map: NotificationMap) => {
  const sortedList = Object.entries(map)
    // @ts-expect-error timestamp
    .sort(([keyA, objA], [keyB, objB]) => new Date(objB.timestamp) - new Date(objA.timestamp))
    .map(([key, obj]) => obj);
  return sortedList;
};
const getNotificationsInLocalStorage = (address: string): NotificationMap => {
  const notifications = localStorage.getItem(`notifications-${address}`);
  if (notifications) {
    return JSON.parse(notifications) as NotificationMap;
  }
  return {};
};

const setNotificationsInLocalStorage = (address: string, map: NotificationMap) => {
  localStorage.setItem(`notifications-${address}`, JSON.stringify(map));
  return map;
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

const cleanRelevantPost = (
  post: IPostPreview,
  notificationType: NotificationType,
): MyNotification => {
  return {
    ...post,
    read: false,
    type: post.depth === 1 ? NotificationType.DiscussionReply : notificationType,
  };
};

const getRelatedPosts = (posts: IPostPreview[], myIds: string[]): MyNotification[] => {
  // Filter posts that have an identity of mine as the root or the parent Id.

  // Using reduce here to filter and map in one function for performance.
  const relevantPosts = posts.reduce((result: MyNotification[], p) => {
    const rootAuthor = p.root?.userId.toLowerCase();
    const parentAuthor = p.parent?.userId.toLowerCase();
    // If rootAuthor is one of my ids, this is discussion reply
    if (rootAuthor && myIds.includes(rootAuthor))
      result.push(cleanRelevantPost(p, NotificationType.DiscussionReply));

    // If parentAuthor is one of my ids, this is a direct reply
    if (parentAuthor && myIds.includes(parentAuthor))
      result.push(cleanRelevantPost(p, NotificationType.DirectReply));

    return result;
  }, []);

  return relevantPosts;
};

const useNotifications = (enabled = true) => {
  const { address } = useAccount();
  const { nymOptions } = useUserInfo({ address });
  const [notifications, setNotifications] = useState<MyNotification[]>();
  const [myUserIds, setMyUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (notifications) {
      setIsLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    const myIds = nymOptions.map((n) => getUserIdFromName(n).toLowerCase());
    if (address) myIds.push(address.toLowerCase());
    setMyUserIds(myIds);
  }, [nymOptions, address]);

  useEffect(() => {
    if (!address || !nymOptions || !enabled) {
      return;
    }
    const fetchData = async () => {
      const data = await axios.get('/api/v1/notifications', {
        params: { startTime: '', endTime: '' },
      });

      const feed = data.data as IPostPreview[];
      // Filter the list for posts with a rootId or parentId authored by my identities.
      // Map to determine if it is a direct or discussion reply
      const relevantPosts = getRelatedPosts(feed, myUserIds);

      // Write to localStorage IF timestamps are greater.
      // First, get localStorage notifications
      let notifications = getNotificationsInLocalStorage(address);
      if (Object.keys(notifications).length > 0) {
        // Add new posts if they don't exist yet.
        relevantPosts.map((p) => {
          if (!(p.id in notifications)) {
            // Update the `notifications object`
            notifications[p.id] = p;
          }
        });
      }

      // Add the new notifications map to localStorage
      setNotificationsInLocalStorage(address, notifications);

      // Convert map to ordered list and export from hook.
      setNotifications(notificationsMapToOrderedList(notifications));
    };

    fetchData();
  }, [address, nymOptions, myUserIds, enabled]);

  return { notifications, isLoading };
};

export default useNotifications;
