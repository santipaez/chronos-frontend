import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Clock, PlusCircle, Menu, ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import EventScreen from './screens/EventScreen';
import DrawerContent from './components/DrawerContent';
import ProfileScreen from './screens/ProfileScreen';
import OptionsScreen from './screens/OptionsScreen';
import LogoutScreen from './screens/LogoutScreen';


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
            <Tab.Screen
                name="Horarios"
                component={ScheduleScreen}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 16 }}>
                            <Menu color={isDarkMode ? "#ffffff" : "#000000"} size={24} />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Tab.Screen
                name="Agendar"
                component={EventScreen}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 16 }}>
                            <Menu color={isDarkMode ? "#ffffff" : "#000000"} size={24} />
                        </TouchableOpacity>
                    ),
                })}
            />
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
                <Drawer.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
                <Drawer.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                <Drawer.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
                <Drawer.Screen name="HomeScreen" options={{ headerShown: false }} >
                    {props => <TabNavigator {...props} isDarkMode={isDarkMode} />}
                </Drawer.Screen>
                <Drawer.Screen name="ProfileScreen" component={ProfileScreen} options={({ navigation }) => ({
                    headerShown: true,
                    title: 'Mi perfil',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.navigate(HomeScreen)} style={{ marginLeft: 16 }}>
                            <ArrowLeft color={isDarkMode ? "#ffffff" : "#000000"} size={24} />
                        </TouchableOpacity>
                    ),
                })} />
                <Drawer.Screen name="OptionsScreen" component={OptionsScreen} options={({ navigation }) => ({
                    headerShown: true,
                    title: 'Opciones',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.navigate(HomeScreen)} style={{ marginLeft: 16 }}>
                            <ArrowLeft color={isDarkMode ? "#ffffff" : "#000000"} size={24} />
                        </TouchableOpacity>
                    ),
                })} />
                <Drawer.Screen name="LogoutScreen" component={LogoutScreen} options={{ headerShown: true, title: 'Cerrar sesión' }} />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}