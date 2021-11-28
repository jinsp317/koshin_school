import {
  ImageSource,
  RemoteImage,
} from './type';

export {
  ImageSource,
  RemoteImage,
} from './type';

export const imageSignIn1Bg: ImageSource = {
  imageSource: require('./source/cloud_disabled.png'),
};
export const imageCamera: ImageSource = {
  imageSource: require('./source/camera.png'),
};
export const imageIsensLogo: ImageSource = {
  imageSource: require('./source/isens_logo.png'),
};
export const imageTestQuality: ImageSource = {
  imageSource: require('./source/test_quality.png'),
};
export const imageDelete: ImageSource = {
  imageSource: require('./source/delete.png'),
};

export const movieImage1: ImageSource = new RemoteImage(
  'https://upload.wikimedia.org/wikipedia/en/f/fd/How_to_Train_Your_Dragon_3_poster.png',
);

export const movieImage2: ImageSource = new RemoteImage(
  'https://cdn.newsday.com/polopoly_fs/1.27712483.1551043709!/httpImage/image.jpg_gen/derivatives/landscape_768/' +
  'image.jpg',
);

export const movieImage3: ImageSource = new RemoteImage(
  'http://cdn.collider.com/wp-content/uploads/2018/09/how-to-train-your-dragon-the-hidden-world-hiccup.jpg',
);

export const movieImage4: ImageSource = new RemoteImage(
  'https://cdn.traileraddict.com/content/extra-thumbs/309962472-3.jpg',
);

export const movieImage5: ImageSource = new RemoteImage(
  'https://www.iamag.co/wp-content/uploads/2018/10/HOW-TO-TRAIN-YOUR-DRAGON-THE-HIDDEN-WORLD-4-1-1024x430.jpg',
);
