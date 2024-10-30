import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplet, Wind, BarChart2 } from 'lucide-react-native';

const Weather = ({ data, getWeatherIcon }) => {
    const textColor = '#fff';
    const roundedTemp = Math.round(data.main.temp);
    const roundedWindSpeed = Math.round(data.wind.speed);

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
        <View style={styles.container}>
            <View style={styles.weatherBox}>
                <View style={styles.cityRow}>
                    <Text style={[styles.city, { color: textColor }]}>{data.name}</Text>
                    {getWeatherIcon(data.weather[0].main)}
                </View>
                <Text style={[styles.temperature, { color: textColor }]}>{roundedTemp}°C</Text>
                <Text style={[styles.description, { color: textColor }]}>{translateDescription(data.weather[0].description)}</Text>
            </View>
            <View style={styles.detailsBox}>
                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Droplet color="#00BFFF" size={32} />
                        <Text style={[styles.detail, { color: textColor }]}>{data.main.humidity}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Wind color="#1E90FF" size={32} />
                        <Text style={[styles.detail, { color: textColor }]}>{roundedWindSpeed} m/s</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <BarChart2 color="#FFD700" size={32} />
                        <Text style={[styles.detail, { color: textColor }]}>{data.main.pressure} hPa</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    weatherBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'flex-start',
        marginBottom: 20,
        width: '100%',
    },
    cityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    city: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    temperature: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 24,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    detailsBox: {
        marginTop: 20,
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        width: '100%',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    detailItem: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    detail: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 5,
    },
});

export default Weather;