export const users = {
  title: 'Users',
  noUsers: 'No users found.',
  fetchError: 'Could not fetch users:',
  filters: {
    all: 'All',
    doxed: 'Doxed',
    pseudo: 'Pseudo',
  },
  sort: {
    lastActive: 'Last Active',
    numPosts: 'Posts',
    numReplies: 'Replies',
    upvotes: 'Votes',
  },
};
export const user = {
  noData: 'User has no activity.',
  fetchError: 'Could not fetch user data:',
  filters: {
    all: 'All',
    posts: 'Posts',
    replies: 'Replies',
  },
  backButtonText: 'All users',
};
export const userTag = {
  lastActive: 'Last active',
  dash: '-',
};
export const posts = {
  title: 'Posts',
  filters: {
    timestamp: '⏳ Recent',
    upvotes: '🔥 Top',
  },
  buttonText: 'Start Discussion',
  action: 'post',
  fetchError: 'Could not fetch posts:',
};
export const postId = {
  backButtonText: 'All posts',
};
export const upvote = {
  fetchError: 'Could not upvote:',
  action: 'upvote',
};
export const upvoteWarning = {
  title: "You're voting as",
  body: 'Voting is currently only possible from a wallet, not a nym. Are you sure you want to vote with your wallet identity?',
  buttonText: 'Vote',
};
export const notifications = {
  title: 'Notifications',
  noNotifications: 'No notifications.',
  fetchError: 'Could not fetch notifications:',
  action: 'get notifications',
  seeAllNotifications: 'See All Notifications',
  markAllAsRead: 'Mark all as read',
  markAsRead: 'Mark as read',
  lastUpdated: 'Last updated: ',
};
export const nestedReply = {
  showMoreReplies: 'Show more replies',
  showingMoreReplies: 'Showing more replies...',
};
export const postPreview = {
  repliedTo: 'replied to',
  postedBy: 'Posted by',
};
export const postWithReplies = {
  showingParentReplies: 'Showing parent replies...',
  showParentReplies: 'Show parent replies',
  fetchError: 'Could not fetch post:',
};
export const replyText = {
  reply: 'reply',
  replies: 'replies',
};
export const nameSelect = {
  postingAs: 'Posting as',
  newNym: 'New Pseudo Nym',
};
export const newNym = {
  beforeTitle: 'Create a new pseudo',
  afterTitle: 'New pseudoynm created!',
  beforeBody: 'You can re-use this nym as long as you control wallet you use to create it.',
  afterBody: 'Your new nym now exists in the world. Use it wisely.',
  beforeButtonText: 'Confirm',
  afterButtonText: 'Say something',
  placeholder: 'Name',
  generateRandom: 'Generate a random name',
  fetchError: 'Could not create pseudo:',
  inputError: {
    noName: 'Must submit a valid name.',
    duplicate: 'Nym already exists.',
  },
};
export const newPost = {
  title: 'Start a discussion here',
};
export const postWriter = {
  inputError: {
    noTitle: 'title cannot be empty',
    noBody: 'post cannot be empty',
    noName: 'must select an identity to post',
    invalidName: 'must select a valid identity to post',
  },
  action: 'reply',
  fetchError: 'Coult not submit post:',
  userError: 'Error:',
  placeholder: {
    title: 'Add title',
    newBody: 'Description',
    replyBody: 'Type your post here',
  },
  buttonText: {
    before: 'Send',
    loading: 'Proving',
    after: 'Sent',
  },
};
export const discardPostWarning = {
  body: 'You have a post in progress, are you sure you want to discard it?',
  buttonText: {
    okay: 'Okay',
    cancel: 'Cancel',
  },
};
export const walletWarning = {
  title: 'Connect a valid wallet to',
  body: 'If you want to post, reply, or upvote, you must connect a wallet that owns a noun or is part of a multi-sig that owns a noun. If your wallet recently became valid, allow 24 hours to see the changes reflected.',
};
export const validUserWarning = {
  title: 'The connected wallet is not valid.',
  body: 'If you want to post, reply, or upvote, you must connect a wallet that owns a noun or is part of a multi-sig that owns a noun. If your wallet recently became valid, allow 24 hours to see the changes reflected.',
};
export const error404 = {
  title: '404',
  subtitle: 'Page Not Found',
};
export const error500 = {
  title: '500',
  subtitle: 'Internal Server Error',
};
export const header = {
  title: 'Noun Nyms',
  allUsers: 'All users',
  myIdentities: 'My identities',
  wallet: 'My wallet',
};

export const error = {
  title: 'Uh oh!',
  subtitle: 'Error unknown.',
};
export const errorPage = {
  returnHome: 'Return Home',
};
