// chronos-frontend/components/Weather.js
import React from 'react';
import { StyleSheet } from 'react-native';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react-native';

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

const styles = StyleSheet.create({
    weatherIcon: {
        marginLeft: 8,
    },
});