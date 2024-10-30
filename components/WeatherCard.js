import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WeatherCard = ({ forecast, getWeatherIcon }) => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const roundedTemp = Math.round(forecast.main.temp);

    const translateDescription = (description) => {
        const translations = {
            'clear sky': 'cielo despejado',
            'few clouds': 'pocas nubes',
            'scattered clouds': 'nubes dispersas',
            'broken clouds': 'nubes rotas',
            'shower rain': 'lluvia ligera',
            'rain': 'lluvia',
            'thunderstorm': 'tormenta',
            'snow': 'nieve',
            'mist': 'niebla',
        };
        return translations[description] || description;
    };

    return (
        <View style={styles.card}>
            <Text style={styles.day}>{day}</Text>
            <Text style={styles.time}>{time}</Text>
            {getWeatherIcon(forecast.weather[0].main)}
            <Text style={styles.temperature}>{roundedTemp}°C</Text>
            <Text style={styles.description}>{translateDescription(forecast.weather[0].description)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
        padding: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        maxHeight: '45%',
        width: 130,
        flexShrink: 1, // Evitar que la tarjeta se expanda más allá de su contenido
    },
    day: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 14,
        color: '#555',
        fontWeight: 'bold',
    },
    temperature: {
        fontSize: 18,
        marginVertical: 5,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#777',
        fontWeight: 'bold',
    },
});

export default WeatherCard;