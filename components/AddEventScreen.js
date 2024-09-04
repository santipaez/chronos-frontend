import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddEventScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendar Evento</Text>
      <Text>Aquí puedes añadir un nuevo evento a tu calendario.</Text>
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