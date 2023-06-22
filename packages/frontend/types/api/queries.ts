// object defining all 'feed-type' post queries a frontend might make
export type RawPostsQuery = {
  userId?: string;
  skip?: string;
  take?: string;
  sort?: string;
  startTime?: string;
  endTime?: string;
  includeReplies?: string;
};

export type PostsQuery = {
  userId?: string;
  skip?: number;
  take?: number;
  sort?: string;
  startTime?: string;
  endTime?: string;
  includeReplies?: boolean;
};
