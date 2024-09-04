import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RoutineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutina</Text>
      <Text>Aquí puedes organizar y ver tu rutina diaria.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});