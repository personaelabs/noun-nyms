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
