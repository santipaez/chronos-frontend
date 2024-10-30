// chronos-frontend/components/Weather.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react-native';

export const fetchTemperature = async (date) => {
    try {
        const storedCity = await AsyncStorage.getItem('@selected_city');
        const city = storedCity ? JSON.parse(storedCity) : null;
        const token = await AsyncStorage.getItem('@jwt_token');

        const { lat, lon } = city.coord;

        const response = await axios.get(`http://192.168.100.30:8080/forecast?lat=${lat}&lon=${lon}`, {
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

export const getWeatherIcon = (weather) => {
    switch (weather) {
        case 'Clear':
            return <Sun size={24} color="#FFA500" style={styles.weatherIcon} />; // Color más oscuro
        case 'Clouds':
            return <Cloud size={24} color="#B0C4DE" style={styles.weatherIcon} />;
        case 'Rain':
            return <CloudRain size={24} color="#1E90FF" style={styles.weatherIcon} />;
        case 'Snow':
            return <CloudSnow size={24} color="#00BFFF" style={styles.weatherIcon} />;
        case 'Thunderstorm':
            return <CloudLightning size={24} color="#FFA500" style={styles.weatherIcon} />;
        default:
            return null;
    }
};

export const fetchCityFromCoords = async (lat, lon) => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await axios.get(`http://192.168.100.30:8080/weather?lat=${lat}&lon=${lon}`, {
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

const styles = StyleSheet.create({
    weatherIcon: {
        marginLeft: 8,
    },
});