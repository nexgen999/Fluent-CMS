export const getTwitterEmojiUrl = (unicode: string): string => {
  const code = unicode.toLowerCase().replace(/u\+/g, '').replace(/\s+/g, '-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${code}.svg`;
};
