import axios from 'axios';
import { SCHEDULE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('@jwt_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Obtener todos los horarios
export const getSchedules = async () => {
    try {
        const headers = await getHeaders();
        const response = await axios.get(SCHEDULE_URL, { headers });
        return response.data;
    } catch (error) {
        console.error('Error al obtener los horarios:', error);
        throw error;
    }
};

// Obtener todos los horarios por día
export const getSchedulesByDay = async (day) => {
    try {
        const headers = await getHeaders();
        const response = await axios.get(`${SCHEDULE_URL}/day/${day}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error al obtener los horarios por día:', error);
        throw error;
    }
};


// Obtener un horario por ID
export const getScheduleById = async (id) => {
    try {
        const headers = await getHeaders();
        const response = await axios.get(`${SCHEDULE_URL}/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el horario con ID ${id}:`, error);
        throw error;
    }
};

// Crear un nuevo horario
export const createSchedule = async (schedule) => {
    try {
        const headers = await getHeaders();
        const response = await axios.post(SCHEDULE_URL, schedule, { headers });
        return response.data;
    } catch (error) {
        console.error('Error al crear el horario:', error);
        throw error;
    }
};

// Actualizar un horario por ID
export async function updateSchedule(id, schedule) {
    const headers = await getHeaders();
    try {
        const response = await axios.put(`${SCHEDULE_URL}/${id}`, schedule, { headers });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update schedule');
    }
}

// Eliminar un horario por ID
export const deleteSchedule = async (id) => {
    try {
        const headers = await getHeaders();
        const response = await axios.delete(`${SCHEDULE_URL}/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el horario con ID ${id}:`, error);
        throw error;
    }
};