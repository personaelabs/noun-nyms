export type UserPostCounts = {
  userId: string;
  numPosts: number;
  numReplies: number;
  lastActive: Date | null;
  doxed: boolean;
};
