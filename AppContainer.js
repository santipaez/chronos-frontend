import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Clock, PlusCircle, Menu } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import Welcome from './components/Welcome';
import HomeScreen from './components/HomeScreen';
import ScheduleScreen from './components/ScheduleScreen';
import RoutineScreen from './components/RoutineScreen';
import AddEventScreen from './components/AddEventScreen';
import DrawerContent from './components/DrawerContent';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator({ isDarkMode }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === 'Inicio') {
            icon = <Home color={color} size={size} />;
          } else if (route.name === 'Horarios') {
            icon = <Calendar color={color} size={size} />;
          } else if (route.name === 'Rutina') {
            icon = <Clock color={color} size={size} />;
          } else if (route.name === 'Agendar') {
            icon = <PlusCircle color={color} size={size} />;
          }

          return icon;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 16 }}>
              <Menu color={isDarkMode ? "#ffffff" : "#000000"} size={24} />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen name="Horarios" component={ScheduleScreen} />
      <Tab.Screen name="Rutina" component={RoutineScreen} />
      <Tab.Screen name="Agendar" component={AddEventScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Drawer.Navigator 
        drawerContent={(props) => <DrawerContent {...props} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}
        screenOptions={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 16 }}>
              <Menu color={isDarkMode ? "#ffffff" : "#000000"} size={24} />
            </TouchableOpacity>
          ),
        })}
      >
        <Drawer.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
        <Drawer.Screen name="HomeScreen" options={{ headerShown: false }} >
          {props => <TabNavigator {...props} isDarkMode={isDarkMode} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}