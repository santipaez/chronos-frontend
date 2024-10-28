import axios from 'axios';
import { AUTH_URL } from '../config';

export const handleRegister = async (username, email, password) => {
    try {
        console.log(username, email, password);
        const response = await axios.post(`${AUTH_URL}/register`, {
            username,
            email,
            password
        });
        return response;
    } catch (err) {
        throw err;
    }
};

export const onRegister = async (username, email, password, setError, setSuccess, navigation) => {
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