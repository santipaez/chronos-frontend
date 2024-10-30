// chronos-frontend/components/EventList.js
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Edit, Trash } from 'lucide-react-native';
import { getWeatherIcon } from './Weather';

const EventList = ({ events, temperatures, colors, styles, formatDate, openEventModal, handleDeleteEvent, setEditingEvent, setName, setDescription, setStartTime, setSelectedDate, setModalVisible, dark }) => {
    const renderEventItem = ({ item }) => (
        <View>
            <View style={styles.eventDateHeaderContainer}>
                <Text style={[styles.eventDateHeader, { color: colors.primary }]}>{formatDate(item.date)}</Text>
                <View style={styles.weatherContainer}>
                    {temperatures[item.date]?.temp !== null && temperatures[item.date]?.temp !== undefined && (
                        <>
                            <Text style={[styles.eventTemperature, { color: colors.primary, fontWeight: 'bold' }]}>
                                {`${Math.round(temperatures[item.date].temp)}°C`}
                            </Text>
                            {getWeatherIcon(temperatures[item.date].icon)}
                        </>
                    )}
                </View>
            </View>
            <View style={[styles.eventItem, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => {
                    setEditingEvent(item);
                    setName(item.name);
                    setDescription(item.description);
                    setStartTime(new Date(`1970-01-01T${item.startTime}:00`));
                    setSelectedDate(item.date);
                    setModalVisible(true);
                }} style={styles.editButtonContainer}>
                    <Edit size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.eventName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.eventDescription, { color: dark ? '#fff' : colors.textSecondary }]}>{item.description || 'Sin descripción'}</Text>
                <Text style={[styles.eventTime, { color: dark ? '#fff' : colors.textSecondary }]}>{`A las: ${item.startTime}`}</Text>
                <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.deleteButtonContainer}>
                    <Trash size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <FlatList
            data={events}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEventItem}
            contentContainerStyle={styles.eventList}
        />
    );
};

export default EventList;