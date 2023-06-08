import { IPostPreview } from './postPreviewSelect';
import { IUserUpvote } from './userUpvotesSelect';

// Either Upvote or Post

export type RawNotifications = { upvotes: IUserUpvote[]; posts: IPostPreview[] };
