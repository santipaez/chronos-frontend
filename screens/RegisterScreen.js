import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { handleRegister } from '../API';

const RegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation();
    const animatedFormValue = useSharedValue(0);

    useFocusEffect(
        React.useCallback(() => {
            // Reiniciar el estado del error y éxito cuando la pantalla gana el foco
            setError('');
            setSuccess('');
            animatedFormValue.value = 0; // Reiniciar el valor de la animación
            animatedFormValue.value = withTiming(1, {
                duration: 1500,
                easing: Easing.out(Easing.exp),
            });
        }, [])
    );

    const onRegister = async (username, email, password, setError, setSuccess, navigation) => {
        setError('');
        setSuccess('');
        try {
            const response = await handleRegister(username, email, password);
            if (response.status === 200) {
                setSuccess('Cuenta creada exitosamente. Redirigiendo al login...');
                setTimeout(() => {
                    navigation.navigate('LoginScreen');
                }, 2000); // Espera 2 segundos antes de redirigir al login
            } else {
                setError('Registro fallido');
            }
        } catch (err) {
            setError('Registro fallido');
        }
    };

    const formAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: animatedFormValue.value,
            transform: [
                {
                    translateY: animatedFormValue.value * 50,
                },
            ],
        };
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'android' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'android' ? -100 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={33} />
                    <Text style={{ color: '#fff', fontSize: 18, marginLeft: 8 }}>Volver</Text>
                </TouchableOpacity>
                <Animated.Text style={[styles.title, formAnimatedStyle]}>Registrate</Animated.Text>
                <Animated.View style={[styles.form, formAnimatedStyle]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de usuario"
                        placeholderTextColor={'#ccc'}
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        placeholderTextColor={'#ccc'}
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        placeholderTextColor={'#ccc'}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    {success ? <Text style={styles.success}>{success}</Text> : null}
                    <TouchableOpacity style={styles.button} onPress={() => onRegister(username, email, password, setError, setSuccess, navigation)}>
                        <Text style={styles.buttonText}>Registrarse</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000ff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        top: 80,
        left: 16,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'transparent',
        borderRadius: 10,
        padding: 20,
        marginTop: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
    },
    title: {
        fontSize: 48,
        top: 200,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#3f3f3f',
        color: '#ffffff',
    },
    button: {
        backgroundColor: '#4d9aff',
        paddingVertical: 15,
        marginTop: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    success: {
        color: 'green',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default RegisterScreen;