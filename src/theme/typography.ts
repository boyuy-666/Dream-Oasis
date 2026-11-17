import { TextStyle } from 'react-native';

/** Font family names as registered by @expo-google-fonts in the root layout. */
export const fonts = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'InstrumentSans_400Regular',
  bodyMedium: 'InstrumentSans_500Medium',
  bodySemibold: 'InstrumentSans_600SemiBold',
  bodyBold: 'InstrumentSans_700Bold',
};

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 33 },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26 },
  quote: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodySemibold, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fonts.bodySemibold, fontSize: 16, lineHeight: 20, letterSpacing: 0.16 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.5, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;
