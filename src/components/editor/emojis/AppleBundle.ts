export const getAppleEmojiUrl = (unicode: string): string => {
  const code = unicode.toLowerCase().replace(/u\+/g, '').replace(/\s+/g, '-');
  return `https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64/${code}.png`;
};
