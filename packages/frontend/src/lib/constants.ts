import { ImageData } from '@nouns/assets';

// array of the different number of options to choose from for
// a given Noun seed
export const NOUNS_AVATAR_RANGES = [
  ImageData.bgcolors.length,
  ImageData.images.bodies.length,
  ImageData.images.accessories.length,
  ImageData.images.heads.length,
  ImageData.images.glasses.length,
];

// generate an array of dummy data of ICommentViewProps
export interface IComment {
  commentId: string;
  message: string;
  title: string;
  createdAt: Date;
  tagName: string;
  profileImgURL: string;
  proof: string;
  children: IComment[];
}

export const TEMP_DUMMY_DATA: IComment[] = [
  {
    commentId: '1',
    message: 'This is a comment',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [],
  },
  {
    commentId: '2',
    message: 'This is a comment too',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [],
  },
  {
    commentId: '3',
    message: 'This is a different comment',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [],
  },
  {
    commentId: '4',
    message: 'This is not a comment',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [],
  },
];

export const TEMP_NESTED_DUMMY_DATA: IComment[] = [
  {
    commentId: '1',
    message: 'This is a comment',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [
      {
        commentId: '1.1a',
        message: 'This is a comment too',
        title: 'What is this?',
        createdAt: new Date(),
        tagName: 'John Doe',
        profileImgURL: '',
        proof: '',
        children: [],
      },
      {
        commentId: '1.1b',
        message: 'This is a different comment',
        title: 'What is this?',
        createdAt: new Date(),
        tagName: 'John Doe',
        profileImgURL: '',
        proof: '',
        children: [],
      },
    ],
  },
  {
    commentId: '2',
    message: 'This is a comment too',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [
      {
        commentId: '2.1a',
        message: 'This is a comment too',
        title: 'What is this?',
        createdAt: new Date(),
        tagName: 'John Doe',
        profileImgURL: '',
        proof: '',
        children: [],
      },
      {
        commentId: '2.1b',
        message: 'This is a different comment',
        title: 'What is this?',
        createdAt: new Date(),
        tagName: 'John Doe',
        profileImgURL: '',
        proof: '',
        children: [
          {
            commentId: '2.1b.1',
            message: 'This is a different comment',
            title: 'What is this?',
            createdAt: new Date(),
            tagName: 'John Doe',
            profileImgURL: '',
            proof: '',
            children: [],
          },
          {
            commentId: '2.1b.2',
            message: 'This is not a comment',
            title: 'What is this?',
            createdAt: new Date(),
            tagName: 'John Doe',
            profileImgURL: '',
            proof: '',
            children: [],
          },
        ],
      },
    ],
  },
  {
    commentId: '3',
    message: 'This is a different comment',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [],
  },
  {
    commentId: '4',
    message: 'This is not a comment',
    title: 'What is this?',
    createdAt: new Date(),
    tagName: 'John Doe',
    profileImgURL: '',
    proof: '',
    children: [],
  },
];
