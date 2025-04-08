import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>© 2025 NEUVIS MDRPLT - All Rights Reserved</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#252525',
    fontSize: 12,
    opacity: 0.7,
  },
});
