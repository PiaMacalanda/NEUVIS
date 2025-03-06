import { TextStyle } from 'react-native';
import colors from './colors';

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

export const typography = {
  header: {
    h1: {
      fontSize: fontSizes.xxxl,
      fontWeight: fontWeights.bold,
      color: colors.text.dark,
    },
    h2: {
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      color: colors.text.dark,
    },
    h3: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      color: colors.text.dark,
    },
  },
  body: {
    regular: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.regular,
      color: colors.text.dark,
    },
    medium: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      color: colors.text.dark,
    },
    small: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.regular,
      color: colors.text.gray,
    },
  },
  button: {
    large: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
    },
    medium: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    small: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
  },
};

export default typography;