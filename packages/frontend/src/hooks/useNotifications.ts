import axios from 'axios';
import { useEffect, useState } from 'react';
import { IPostPreview } from '@/types/api';
import { ClientName, NotificationType } from '@/types/components';
import { Notification } from '@/types/components';
import { getNymOptions } from './useUserInfo';
import { getUserIdFromName } from '@/lib/example-utils';
import { useAccount } from 'wagmi';

interface NotificationMap {
  [id: string]: Notification;
}

export const notificationsListToMap = (notifications: Notification[]) => {
  const map = notifications.reduce((result: NotificationMap, obj) => {
    result[obj.id] = obj;
    return result;
  }, {});
  return map;
};

export const notificationsMapToOrderedList = (map: NotificationMap) => {
  const sortedList = Object.entries(map)
    // @ts-expect-error timestamp
    .sort(([keyA, objA], [keyB, objB]) => new Date(objB.timestamp) - new Date(objA.timestamp))
    .map(([key, obj]) => obj);
  return sortedList;
};

export const getNotificationsInLocalStorage = (address: string): NotificationMap => {
  const notifications = localStorage.getItem(`notifications-${address}`);
  if (notifications) {
    return JSON.parse(notifications) as NotificationMap;
  }
  return {};
};

export const setNotificationsInLocalStorage = (address: string, map: NotificationMap) => {
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

const buildNotifications = (posts: IPostPreview[], myIds: string[]): Notification[] => {
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

  const fetchNotifications = async (address: string, nymOptions: ClientName[]) => {
    const myUserIds = nymOptions.map((n) => getUserIdFromName(n).toLowerCase());
    myUserIds.push(address.toLowerCase());

    const data = await axios.get('/api/v1/notifications', {
      params: { startTime: '', endTime: '' },
    });

    const feed = data.data as IPostPreview[];
    // Filter the list for posts with a rootId or parentId authored by my identities.
    // Map to determine if it is a direct or discussion reply
    const serverNotifications = buildNotifications(feed, myUserIds);

    // Write to localStorage IF timestamps are greater.
    // First, get localStorage notifications
    let notifications = getNotificationsInLocalStorage(address);
    if (Object.keys(notifications).length > 0) {
      // Add new posts if they don't exist yet.
      serverNotifications.map((p) => {
        if (!(p.entityId in notifications)) {
          // Update the `notifications object`
          notifications[p.entityId] = p;
        }
      });
    } else {
      // First time localStorage is used, we set all data to it.
      notifications = notificationsListToMap(serverNotifications);
    }

    // Add the new notifications map to localStorage
    setNotificationsInLocalStorage(address, notifications);

    // Convert map to ordered list and export from hook.
    setNotifications(notificationsMapToOrderedList(notifications));
  };

  useEffect(() => {
    if (notifications) {
      setIsLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    // Getting nymOptions to avoid an error where sometime nymOptiosn are out of sync with the address
    const nymOptions = getNymOptions(address);
    if (!address || !nymOptions || !enabled) {
      return;
    }
    fetchNotifications(address, nymOptions);
  }, [address, enabled]);

  return { notifications, setNotifications, fetchNotifications, isLoading };
};

export default useNotifications;
