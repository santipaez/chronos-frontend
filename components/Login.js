import { handleLogin } from '../Axios';

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