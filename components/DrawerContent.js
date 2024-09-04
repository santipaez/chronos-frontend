import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { MoonStar, Sun, Clock } from 'lucide-react-native';

export default function DrawerContent(props) {
  const textColor = props.isDarkMode ? '#ffffff' : '#000000';
  const backgroundColor = props.isDarkMode ? '#181818' : '#ffffff';

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor }}>
      <View style={styles.drawerContent}>
        <View style={styles.header}>
          <Clock color={textColor} size={48} style={styles.icon} />
          <Text style={[styles.title, { color: textColor }]}>Chronos</Text>
        </View>
        {/* Otros elementos del drawer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={props.toggleTheme}>
            {props.isDarkMode ? (
              <Sun color={textColor} size={64} />
            ) : (
              <MoonStar color={textColor} size={64} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 740,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  icon: {
    marginLeft: 0,
  },
  footer: {
    // Estilos para el footer
  },
});