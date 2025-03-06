export { default as colors } from './colors';
export { default as spacing } from './spacing';
export { default as typography, fontSizes, fontWeights } from './typography';
export { default as Button } from './buttons';
export { default as Logo } from './logo';

// Export the theme as a single object
const theme = {
  colors: require('./colors').default,
  spacing: require('./spacing').default,
  typography: require('./typography').default,
  Button: require('./buttons').default,
  Logo: require('./logo').default,
};

export default theme;