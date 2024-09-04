import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horarios</Text>
      <Text>Aquí puedes ver y gestionar tus horarios.</Text>
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