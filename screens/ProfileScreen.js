import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('@jwt_token');
        const userId = await AsyncStorage.getItem('@user_id'); // Suponiendo que el ID del usuario está almacenado en AsyncStorage
        const response = await fetch(`https://192.168.100.30/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setUsername(data.username || 'Usuario');
        setEmail(data.email ? `${data.email[0]}***@***.com` : 'e***@***.com');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre de usuario:</Text>
      <Text style={styles.value}>{username}</Text>
      <Text style={styles.label}>Correo electrónico:</Text>
      <Text style={styles.value}>{email}</Text>
      <Text style={styles.label}>Contraseña:</Text>
      <Text style={styles.value}>********</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  value: {
    fontSize: 16,
    marginTop: 10,
  },
});