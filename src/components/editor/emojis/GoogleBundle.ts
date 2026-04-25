export const getGoogleEmojiUrl = (unicode: string): string => {
  const code = unicode.toLowerCase().replace(/u\+/g, '').replace(/\s+/g, '-');
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.webp`;
};
