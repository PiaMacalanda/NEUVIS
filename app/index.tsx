import React from 'react';
import { Image, StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, colors, typography, Logo } from '../components';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>

      <View style={styles.logoContainer}>
        <Logo size="large" />
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
            title='Sign in to Google Account'
            variant="outline"
            icon="logo-google"
            onPress={() => router.push('/neuvisLanding')}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title='Privacy & Policy'
            variant='underline'
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 30,
    alignSelf: 'center',
  },
  buttonGroup: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
});