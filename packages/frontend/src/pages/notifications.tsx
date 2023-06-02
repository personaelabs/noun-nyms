import { RetryError } from '@/components/global/RetryError';
import { Header } from '@/components/Header';
import Spinner from '@/components/global/Spinner';
import useError from '@/hooks/useError';
import useNotifications from '@/hooks/useNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faReplyAll, faCircleUp } from '@fortawesome/free-solid-svg-icons';
import { NotificationType, ReplyNotification } from '@/types/components';

const getNotificationIconFromType = (type: NotificationType) => {
  switch (type) {
    case NotificationType.DirectReply:
      return <FontAwesomeIcon icon={faReplyAll} />;
    case NotificationType.DiscussionReply:
      return <FontAwesomeIcon icon={faReply} />;
    default:
      return <FontAwesomeIcon icon={faCircleUp} color={'#0e76fd'} />;
  }
};

export default function Notifications() {
  const { errorMsg, setError } = useError();

  const { notifications, isLoading } = useNotifications();

  return (
    <main>
      <h1>Notifications</h1>
      <br></br>
      <Header />
      <main>
        <div className="w-full bg-gray-50 flex flex-col justify-center items-center">
          <div className="bg-gray-50 min-h-screen w-full">
            <div className="flex flex-col gap-8 max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
              <div className="flex justify-between">
                <h3>Notifications</h3>
              </div>
              {isLoading ? (
                <Spinner />
              ) : notifications ? (
                <>
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n, i) => {
                      return n.type === NotificationType.Upvote ? (
                        <div className="flex gap-4 items-center" key={i}>
                          {getNotificationIconFromType(n.type)}
                          <a href={`/users/${n.userId}`}>{n.userName}</a>
                          <a href={`/posts/${n.postId}`}>{n.postText}</a>
                        </div>
                      ) : (
                        <div className="flex gap-4 items-center" key={i}>
                          {getNotificationIconFromType(n.type)}
                          <a href={`/users/${n.userId}`}>{n.userName}</a>
                          <div className="flex-col gap-2">
                            <p>
                              <a href={`/posts/${n.id}`}>{(n as ReplyNotification).replyText}</a>
                            </p>
                            <p>
                              <sub>
                                <a href={`/posts/${n.postId}`}>{n.postText}</a>
                              </sub>
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center">No notifications</p>
                  )}
                </>
              ) : (
                <RetryError
                  message="Could not fetch users."
                  error={errorMsg}
                  refetchHandler={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </main>
  );
}
