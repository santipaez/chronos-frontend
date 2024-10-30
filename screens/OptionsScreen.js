import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Settings, Bell } from 'lucide-react-native';

export default function OptionsScreen() {
  const [notificationHours, setNotificationHours] = useState(12);
  const [city, setCity] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      const storedNotificationHours = await AsyncStorage.getItem('@notification_hours');
      if (storedNotificationHours !== null) {
        setNotificationHours(parseInt(storedNotificationHours, 10));
      }
      const storedCity = await AsyncStorage.getItem('@selected_city');
      if (storedCity) {
        setSelectedCity(JSON.parse(storedCity));
        setCity(JSON.parse(storedCity).name);
      }
    };
    loadSettings();
  }, []);

  const handleNotificationHoursChange = async (hours) => {
    setNotificationHours(hours);
    await AsyncStorage.setItem('@notification_hours', hours.toString());
  };

  const renderOptionScreen = () => (
    <View style={styles.container}>
      <Text style={styles.header}>Configuraciones</Text>
      <View style={styles.divider} />
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Notificaciones</Text>
        </View>
        <View style={styles.option}>
          <Text style={styles.label}>Horas antes de la notificación:</Text>
          <Picker
            selectedValue={notificationHours}
            style={styles.picker}
            onValueChange={handleNotificationHoursChange}
          >
            {[...Array(25).keys()].map(hour => (
              <Picker.Item key={hour} label={`${hour} hora/s`} value={hour} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Ciudad</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Ciudad"
          value={city}
          editable={false}
        />
      </View>
    </View>
  );

  return (
    <FlatList
      data={[{ key: 'options' }]}
      renderItem={renderOptionScreen}
      keyExtractor={(item) => item.key}
    />
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
  picker: {
    width: 150,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});