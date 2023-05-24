export enum MetaTagKeys {
  TITLE = 'title',
  META_TITLE = 'meta_title',
  DESCRIPTION = 'description',
  OG_TYPE = 'og:type',
  OG_TITLE = 'og:title',
  OG_URL = 'og:url',
  OG_DESC = 'og:description',
  OG_IMG = 'og:image',
  TWITTER_CARD = 'twitter:card',
  TWITTER_URL = 'twitter:url',
  TWITTER_TITLE = 'twitter:title',
  TWITTER_DESC = 'twitter:description',
  TWITTER_IMG = 'twitter:image',
}

export interface MetaTag {
  property: string;
  key?: string;
  content: string;
}
