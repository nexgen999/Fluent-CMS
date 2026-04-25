// Mapping hex codes to styles from various providers
// Note: These use standard CDN patterns for emoji assets

import { getGoogleEmojiUrl } from './GoogleBundle';
import { getAppleEmojiUrl } from './AppleBundle';
import { getTwitterEmojiUrl } from './TwitterBundle';
import { getMicrosoftEmojiUrl } from './MicrosoftBundle';
import { getFacebookEmojiUrl } from './FacebookBundle';
export * from './FullEmojiData';

export type EmojiProvider = 'apple' | 'google' | 'microsoft' | 'facebook' | 'twitter';

export const getEmojiUrl = (unicode: string, provider: EmojiProvider): string => {
    switch(provider) {
        case 'google':
            return getGoogleEmojiUrl(unicode);
        case 'twitter':
            return getTwitterEmojiUrl(unicode);
        case 'apple':
            return getAppleEmojiUrl(unicode);
        case 'microsoft':
            return getMicrosoftEmojiUrl(unicode);
        case 'facebook':
        default:
            return getFacebookEmojiUrl(unicode);
    }
};

