import axios from 'axios';
import { AUTH_URL } from './config';

export const handleLogin = async (username, password) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, {
            username,
            password
        });
        return response;
    } catch (err) {
        throw err;
    }
};

export const onLogin = async (username, password, setError, setSuccess, navigation) => {
    setError('');
    setSuccess('');
    try {
        const response = await handleLogin(username, password);
        if (response.status === 200) {
            // Manejar el éxito del login, por ejemplo, navegar a otra pantalla
            navigation.navigate('HomeScreen');
        } else {
            setError('La contraseña o el usuario son incorrectos');
        }
    } catch (err) {
        setError('La contraseña o el usuario son incorrectos');
    }
};