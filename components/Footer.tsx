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
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#8a9aa8',
    fontSize: 12,
  },
});
