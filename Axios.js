import axios from 'axios';

const AUTH_URL = 'http://192.168.100.30:8080/auth';

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