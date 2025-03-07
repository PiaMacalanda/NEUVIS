import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button, colors, typography } from '../components';
import { router } from 'expo-router';

export default function ButtonView() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[typography.header.h1, styles.title]}>NEUVIS Theme</Text>
        <Text style={typography.body.regular}>
          This is a demonstration of the theme components.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={typography.header.h2}>Solid Buttons</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Small"
            size="small"
            onPress={() => router.push('/neuvisLanding')}
          />
          <Button
            title="Medium"
            size="medium"
            onPress={() => console.log('Medium button pressed')}
          />
          <Button
            title="Large"
            size="large"
            onPress={() => console.log('Large button pressed')}
          />
        </View>
        
        <View style={styles.buttonRow}>
          <Button
            title="With Icon"
            icon="add-circle"
            onPress={() => console.log('Icon button pressed')}
          />
          <Button
            title="Loading"
            loading={true}
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={typography.header.h2}>Outline Buttons</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Outline Small"
            variant="outline"
            size="small"
            onPress={() => console.log('Outline small pressed')}
          />
          <Button
            title="Outline Medium"
            variant="outline"
            onPress={() => console.log('Outline medium pressed')}
          />
        </View>
        <View style={styles.buttonRow}>
          <Button
            title="With Right Icon"
            variant="outline"
            icon="arrow-forward"
            iconPosition="right"
            onPress={() => console.log('Outline with icon pressed')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={typography.header.h2}>Ghost Buttons</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Ghost"
            variant="ghost"
            onPress={() => console.log('Ghost button pressed')}
          />
          <Button
            title="Ghost with Icon"
            variant="ghost"
            icon="information-circle"
            onPress={() => console.log('Ghost with icon pressed')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={typography.header.h2}>Text Length Demo</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="OK"
            onPress={() => {}}
          />
        </View>
        <View style={styles.buttonGroup}>
          <Button
            title="Medium Length Text"
            onPress={() => {}}
          />
        </View>
        <View style={styles.buttonGroup}>
          <Button
            title="This is a very long button text to demonstrate auto-width"
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