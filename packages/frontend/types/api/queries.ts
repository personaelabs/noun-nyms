// object defining all 'feed-type' post queries a frontend might make
export type RawPostsQuery = {
  userId?: string;
  skip?: string;
  take?: string;
  sort?: string;
  startTime?: string;
  endTime?: string;
  rootOnly?: string;
};

export type PostsQuery = {
  userId?: string;
  skip?: number;
  take?: number;
  sort?: string;
  startTime?: number;
  endTime?: number;
  rootOnly?: boolean;
};
