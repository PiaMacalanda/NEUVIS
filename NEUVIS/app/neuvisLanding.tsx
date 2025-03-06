import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, colors, typography } from '../theme';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        This is for the logo
      </View>

      <View style={styles.section}>
        <Text style={[typography.header.h1, styles.title]}>NEUVIS</Text>
        <Text style={typography.body.regular}>
          New Era University Visitor Identification System
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={typography.body.regular}>
          This is for the Hero Image
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.buttonGroup}>
          <Button
            title='Scan ID'
            icon="scan-outline"
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title='Manually Input Information'
            icon="create-outline"
            onPress={() => {}}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title='Visitor Logs'
            icon="book-outline"
            onPress={() => {}}
          />
        </View>
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