import axios from 'axios';
import { EVENT_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('@jwt_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Obtener todos los eventos
export const getEvents = async () => {
    try {
        const headers = await getHeaders();
        const response = await axios.get(EVENT_URL, { headers });
        return response.data;
    } catch (error) {
        console.error('Error al obtener los eventos:', error);
        throw error;
    }
};

// Obtener un evento por ID
export const getEventById = async (id) => {
    try {
        const headers = await getHeaders();
        const response = await axios.get(`${EVENT_URL}/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el evento con ID ${id}:`, error);
        throw error;
    }
};

// Crear un nuevo evento
export const createEvent = async (event) => {
    try {
        const headers = await getHeaders();
        const response = await axios.post(EVENT_URL, event, { headers });
        return response.data;
    } catch (error) {
        console.error('Error al crear el evento:', error);
        throw error;
    }
};

// Actualizar un evento por ID
export const updateEvent = async (id, event) => {
    try {
        const headers = await getHeaders();
        const response = await axios.put(`${EVENT_URL}/${id}`, event, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el evento con ID ${id}:`, error);
        throw error;
    }
};

// Eliminar un evento por ID
export const deleteEvent = async (id) => {
    try {
        const headers = await getHeaders();
        const response = await axios.delete(`${EVENT_URL}/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el evento con ID ${id}:`, error);
        throw error;
    }
};