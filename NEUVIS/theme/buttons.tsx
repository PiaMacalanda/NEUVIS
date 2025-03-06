import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from './colors';
import spacing from './spacing';
import typography from './typography';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'solid' | 'outline' | 'ghost';
type IconPosition = 'left' | 'right';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: IconPosition;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  title,
  onPress,
  variant = 'solid',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) => {
  // Size mappings
  const sizeStyles = {
    small: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: 16,
      ...typography.button.small,
    },
    medium: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: 20,
      ...typography.button.medium,
    },
    large: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 25,
      ...typography.button.large,
    },
  };

  // Variant styles
  const variantStyles = {
    solid: {
      backgroundColor: colors.primary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  };

  // Text color based on variant
  const textColor = {
    solid: colors.text.light,
    outline: colors.primary,
    ghost: colors.primary,
  };

  // Icon size based on button size
  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const iconColor = textColor[variant];
  const iconMargin = iconPosition === 'left' ? { marginRight: spacing.xs } : { marginLeft: spacing.xs };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor[variant]} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={iconSize[size]} 
              color={iconColor} 
              style={iconMargin} 
            />
          )}
          <Text style={[{ color: textColor[variant] }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={iconSize[size]} 
              color={iconColor} 
              style={iconMargin} 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start', // This will make the button hug its content
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
    underlineText: {
    textDecorationLine: 'underline',
  },
});

export default Button;