import { Platform, TextStyle } from 'react-native';

export const fonts = {
  display: 'CormorantGaramond_600SemiBold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  body: Platform.select({ ios: 'System', default: 'sans-serif' }) as string,
};

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: 0.3 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36 },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  quote: { fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, letterSpacing: 0.4 },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
} satisfies Record<string, TextStyle>;
