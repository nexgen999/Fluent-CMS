export const getMicrosoftEmojiUrl = (unicode: string): string => {
  const code = unicode.toLowerCase().replace(/u\+/g, '').replace(/\s+/g, '-');
  // Microsoft Fluent Emojis often use 3D or flat styles. Falling back to Noto if needed or dynamic URLs
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.webp`;
};
