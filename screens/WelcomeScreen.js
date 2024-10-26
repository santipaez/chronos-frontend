import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Welcome = () => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [rotateAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();

    useEffect(() => {
        // Animación de fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        // Animación de rotación
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        const timer = setTimeout(async () => {
            // Animación de fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();

            // Verificar si el usuario está autenticado
            const token = await AsyncStorage.getItem('token');
            if (token) {
                // Navegar al componente principal si el usuario está autenticado
                navigation.navigate('HomeScreen');
            } else {
                // Navegar al componente de registro si el usuario no está autenticado
                navigation.navigate('LoginScreen');
            }
        }, 2000); // Cambia el tiempo según sea necesario

        return () => clearTimeout(timer);
    }, [fadeAnim, rotateAnim, navigation]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Animated.View style={{ transform: [{ rotate }] }}>
                <Clock size={150} color="#ffffff" style={styles.icon} />
            </Animated.View>
            <Text style={styles.title}>Chronos</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 32,
        color: '#ffffff',
    },
    icon: {
        marginBottom: 16,
    },
});

export default Welcome;