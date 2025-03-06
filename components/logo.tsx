import React from 'react';
import { Image, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';

interface LogoProps {
  size: 'small' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const Logo = ({ size = 'small', style }: LogoProps) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../assets/NEULogo.png')}
        style={[
          styles.image,
          size === 'small' ? styles.smallImage : styles.largeImage
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // Base image styles
  },
  smallImage: {
    width: 80,
    height: 80,
  },
  largeImage: {
    width: 150,
    height: 150,
  },
});

export default Logo;