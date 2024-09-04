import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Clock } from 'lucide-react-native';

const Welcome = () => {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

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

        const timer = setTimeout(() => {
            // Animación de fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                navigation.navigate('HomeScreen');
            });
        }, 1500);

        return () => clearTimeout(timer);
    }, [navigation, fadeAnim, rotateAnim]);

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