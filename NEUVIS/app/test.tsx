// app/index.tsx
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, colors, typography } from '../components';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[typography.header.h1, styles.title]}>NEUVIS Theme</Text>
        <Text style={typography.body.regular}>
          Current Screen: /test
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  section: {
    marginBottom: 30,
  },
  buttonGroup: {
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
});