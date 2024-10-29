import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { MoonStar, Sun, Clock, User, Settings, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DrawerContent(props) {
  const textColor = props.isDarkMode ? '#ffffff' : '#000000';
  const backgroundColor = props.isDarkMode ? '#181818' : '#ffffff';
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@jwt_token');
    await AsyncStorage.removeItem('@username');
    await AsyncStorage.removeItem('@email');
    setModalVisible(false);
    props.navigation.navigate('LoginScreen');
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollView}>
      <View style={[styles.drawerContent, { backgroundColor }]}>
        <View style={styles.header}>
          <Clock color={textColor} size={48} style={styles.icon} />
          <Text style={[styles.title, { color: textColor }]}>Chronos</Text>
        </View>
        {/* Opciones del menú */}
        <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate('ProfileScreen')}>
          <User color={textColor} size={24} style={styles.icon} />
          <Text style={[styles.menuText, { color: textColor }]}>Mi perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate('OptionsScreen')}>
          <Settings color={textColor} size={24} style={styles.icon} />
          <Text style={[styles.menuText, { color: textColor }]}>Opciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
          <LogOut color={textColor} size={24} style={styles.icon} />
          <Text style={[styles.menuText, { color: textColor }]}>Cerrar sesión</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <TouchableOpacity onPress={props.toggleTheme} style={styles.themeToggle}>
            {props.isDarkMode ? (
              <Sun color={textColor} size={48} />
            ) : (
              <MoonStar color={textColor} size={48} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>¿Estás seguro que deseas cerrar sesión?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                <Text style={styles.modalButtonText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  drawerContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  icon: {
    marginLeft: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 20,
    marginLeft: 16,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  themeToggle: {
    position: 'absolute',
    bottom: 40,
    left: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    height: 200,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#4d9aff',
    width: 80,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});