import axios from 'axios';
import { useEffect, useState } from 'react';
import { IPostPreview } from '@/types/api';
import { NotificationType } from '@/types/components';
import { Notification } from '@/types/components';
import { getNymOptions } from './useUserInfo';
import { getUserIdFromName } from '@/lib/example-utils';
import { useAccount } from 'wagmi';

interface NotificationMap {
  [id: string]: Notification;
}

export const trimAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const trimText = (text: string) => {
  if (text.length < 50) {
    return text;
  }
  return `${text.slice(0, 50)}...`;
};

const notificationsListToMap = (notifications: Notification[]) => {
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

const cleanRelevantPost = (
  post: IPostPreview,
  notificationType: NotificationType,
  upvoteId?: string,
): Notification => {
  // Default is a Reply notification, where entityId is the post id.
  const { title, userId, id, body, timestamp } = post;

  const res = {
    title,
    body,
    id,
    userId,
    timestamp,
    entityId: post.id,
    read: false,
    type: notificationType,
  };

  // Set Notification title for each type
  if (upvoteId && notificationType === NotificationType.Upvote) {
    res.type = NotificationType.Upvote;
    res.entityId = upvoteId;
    if (!res.title) res.title = res.body;
  }
  if (post.parent && notificationType === NotificationType.DirectReply) {
    res.title = post.parent.body;
  }

  if (post.root && notificationType === NotificationType.DiscussionReply) {
    res.title = post.root.title;
  }

  return res;
};

const getRelatedPosts = (posts: IPostPreview[], myIds: string[]): Notification[] => {
  console.log(`my IDS?...`, myIds);
  // Filter posts that have an identity of mine as the root or the parent Id.

  // Using reduce here to filter and map in one function for performance.
  const relevantPosts = posts.reduce((result: Notification[], p) => {
    const rootAuthor = p.root?.userId.toLowerCase();
    const parentAuthor = p.parent?.userId.toLowerCase();
    // If rootAuthor is one of my ids, this is discussion reply
    if (rootAuthor && myIds.includes(rootAuthor))
      result.push(cleanRelevantPost(p, NotificationType.DiscussionReply));
    // If parentAuthor is one of my ids, this is a direct reply
    else if (parentAuthor && myIds.includes(parentAuthor))
      result.push(cleanRelevantPost(p, NotificationType.DirectReply));
    // If I am the author, this is an upvote
    else if (myIds.includes(p.userId) && p.upvotes.length > 0) {
      // Only push if the post has upvotes.
      p.upvotes.map((u) => {
        result.push(cleanRelevantPost(p, NotificationType.Upvote, u.id));
      });
    }

    return result;
  }, []);

  return relevantPosts;
};

const useNotifications = ({ enabled }: { enabled: boolean }) => {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (notifications) {
      setIsLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    console.log(`userAddress`, address);
    const nymOptions = getNymOptions(address);
    if (!address || !nymOptions || !enabled) {
      return;
    }
    console.log(`EFFECT: address: ${address}, nymOptions`, nymOptions);
    const myUserIds = nymOptions.map((n) => getUserIdFromName(n).toLowerCase());
    myUserIds.push(address.toLowerCase());

    const fetchData = async () => {
      console.log(`fetching data for ${address}`);
      const data = await axios.get('/api/v1/notifications', {
        params: { startTime: '', endTime: '' },
      });

      const feed = data.data as IPostPreview[];
      // Filter the list for posts with a rootId or parentId authored by my identities.
      // Map to determine if it is a direct or discussion reply
      const relevantPosts = getRelatedPosts(feed, myUserIds);
      console.log(`relevantPosts`, relevantPosts);

      // Write to localStorage IF timestamps are greater.
      // First, get localStorage notifications
      console.log(`getting notifications in local storage for ${address}`);
      let notifications = getNotificationsInLocalStorage(address);
      console.log(`notifications...`, notifications);
      if (Object.keys(notifications).length > 0) {
        // Add new posts if they don't exist yet.
        relevantPosts.map((p) => {
          if (!(p.id in notifications)) {
            // Update the `notifications object`
            notifications[p.id] = p;
          }
        });
      } else {
        // First time localStorage is used
        notifications = notificationsListToMap(relevantPosts);
      }

      // Add the new notifications map to localStorage
      console.log(`setting notifications for ${address}`);
      setNotificationsInLocalStorage(address, notifications);

      // Convert map to ordered list and export from hook.
      setNotifications(notificationsMapToOrderedList(notifications));
    };

    fetchData();
  }, [address, enabled]);

  return { notifications, isLoading };
};

export default useNotifications;
