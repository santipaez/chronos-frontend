import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from 'lucide-react-native';
import { requestNotificationPermissions, cancelAllNotifications } from '../notifications';

export default function OptionsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const storedNotificationsEnabled = await AsyncStorage.getItem('@notifications_enabled');
      if (storedNotificationsEnabled !== null) {
        setNotificationsEnabled(JSON.parse(storedNotificationsEnabled));
      }
    };
    loadSettings();
  }, []);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem('@notifications_enabled', JSON.stringify(newValue));
    if (newValue) {
      await requestNotificationPermissions();
      // Programar notificaciones para eventos futuros
      // Aquí deberías obtener los eventos y horarios y programar las notificaciones
    } else {
      await cancelAllNotifications();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Configuraciones</Text>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>General</Text>
        </View>
        <View style={styles.option}>
          <Text style={styles.label}>Opción de ejemplo:</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Notificaciones</Text>
        </View>
        <View style={styles.option}>
          <Text style={styles.label}>Habilitar Notificaciones:</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#007AFF',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
});