import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCHEDULE_URL, AUTH_URL, EVENT_URL, WEATHER_URL, FORECAST_URL } from './config';
import moment from 'moment';

// Weather.js
export const fetchTemperature = async (date) => {
    try {
        const storedCity = await AsyncStorage.getItem('@selected_city');
        const city = storedCity ? JSON.parse(storedCity) : null;
        const token = await AsyncStorage.getItem('@jwt_token');

        const { lat, lon } = city.coord;

        const response = await axios.get(`${FORECAST_URL}?lat=${lat}&lon=${lon}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            console.error('Error fetching weather data:', response.status, response.statusText, response.data);
            return { temp: null, icon: null };
        }

        const data = response.data;

        if (data && data.list) {
            const eventDate = moment(date).startOf('day');
            const dailyForecasts = data.list.filter(forecast => moment(forecast.dt_txt).isSame(eventDate, 'day'));
            if (dailyForecasts.length > 0) {
                const maxTemp = Math.max(...dailyForecasts.map(forecast => forecast.main.temp_max));
                const weatherIcon = dailyForecasts[0].weather[0].main;
                return { temp: maxTemp, icon: weatherIcon };
            } else {
                return { temp: null, icon: null };
            }
        } else {
            console.error('Error: Datos de pronóstico no disponibles');
            return { temp: null, icon: null };
        }
    } catch (error) {
        console.error('Error fetching temperature:', error);
        return { temp: null, icon: null };
    }
}

export const fetchCityFromCoords = async (lat, lon) => {
    try {
        const token = await AsyncStorage.getItem('@jwt_token');
        const response = await axios.get(`${WEATHER_URL}?lat=${lat}&lon=${lon}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching city from coordinates:', error);
        return null;
    }
};

// Schedule.js
const getHeaders = async () => {
    const token = await AsyncStorage.getItem('@jwt_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getUserIdFromStorage = async () => {
    const userId = await AsyncStorage.getItem('@user_id');
    return userId ? parseInt(userId, 10) : null;
};

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

export const createSchedule = async (schedule) => {
    try {
        const headers = await getHeaders();
        const userId = await AsyncStorage.getItem('@user_id');
        const scheduleWithUser = { ...schedule, user: { id: userId } };
        const response = await axios.post(SCHEDULE_URL, scheduleWithUser, { headers });
        return response.data;
    } catch (error) {
        console.error('Error al crear el horario:', error);
        throw error;
    }
};

export async function updateSchedule(id, schedule) {
    const headers = await getHeaders();
    try {
        const response = await axios.put(`${SCHEDULE_URL}/${id}`, schedule, { headers });
        return response.data;
    } catch (error) {
        throw new Error('Failed to update schedule');
    }
}

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

// Register.js
export const handleRegister = async (username, email, password) => {
    try {
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

// Login.js
export const handleLogin = async (username, password) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, {
            username,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const { token, userId } = response.data; 
        await AsyncStorage.setItem('@jwt_token', token);
        await AsyncStorage.setItem('@user_id', userId.toString());
        return response;
    } catch (err) {
        throw err;
    }
};

// Event.js
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
