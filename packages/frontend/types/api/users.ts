export type UserPostCounts = {
  userId: string;
  numPosts: number;
  numReplies: number;
  lastActive: Date | null;
  doxed: boolean;
  name?: string;
  upvotes: number;
};

export type IUser = {
  userId: string;
  totalPosts: number;
  upvotesReceived: number;
  name: string;
};
