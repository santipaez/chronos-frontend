import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, FlatList, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { createEvent, getEvents, updateEvent, deleteEvent, fetchTemperature } from '../API';
import { ChevronLeft, ChevronRight, Edit, Trash } from 'lucide-react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/es';
import { requestNotificationPermissions, scheduleNotification } from '../components/Notifications';
import { getWeatherIcon } from '../components/Weather';
import { EventModal, ViewEventModal } from '../components/EventModal';

const EventScreen = ({ navigation }) => {
    const { colors, dark } = useTheme();
    const [selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
    const [notificationHours, setNotificationHours] = useState(12);
    const [temperatures, setTemperatures] = useState({});

    useFocusEffect(
        React.useCallback(() => {
            fetchEvents();
            loadSettings();
            requestNotificationPermissions();
        }, [])
    );

    const loadSettings = async () => {
        const storedDateFormat = await AsyncStorage.getItem('@date_format');
        const storedNotificationHours = await AsyncStorage.getItem('@notification_hours');
        if (storedDateFormat) {
            setDateFormat(storedDateFormat);
        }
        if (storedNotificationHours) {
            setNotificationHours(parseInt(storedNotificationHours, 10));
        }
    };

    const fetchEvents = async () => {
        try {
            const events = await getEvents();
            const now = new Date();
            const futureEvents = events.filter(event => new Date(`${event.date}T${event.startTime}`) > now);
            setEvents(futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
            fetchTemperatures(futureEvents);
        } catch (error) {
            console.error('Error al obtener los eventos:', error);
        }
    };

    const fetchTemperatures = async (events) => {
        const newTemperatures = {};
        for (const event of events) {
            const tempData = await fetchTemperature(event.date);
            newTemperatures[event.date] = tempData;
        }
        setTemperatures(newTemperatures);
    };

    const handleCreateEvent = async () => {
        try {
            const event = { name, description, date: selectedDate, startTime: startTime.toTimeString().substring(0, 5) };
            if (editingEvent) {
                await updateEvent(editingEvent.id, event);
                setEditingEvent(null);
            } else {
                await createEvent(event);
            }
            setModalVisible(false);
            setSelectedDate('');
            fetchEvents();

            const eventDateTime = new Date(`${selectedDate}T${startTime.toTimeString().substring(0, 5)}:00`);
            const notificationDateTime = new Date(eventDateTime.getTime() - notificationHours * 60 * 60 * 1000);
            await scheduleNotification(
                'Recordatorio de Evento',
                `Tienes un evento mañana: ${name}\nA las: ${startTime.toTimeString().substring(0, 5)}`,
                notificationDateTime
            );
        } catch (error) {
            console.error('Error al crear el evento:', error);
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await deleteEvent(id);
            fetchEvents();
        } catch (error) {
            console.error('Error al eliminar el evento:', error);
        }
    };

    const openModal = (date) => {
        setSelectedDate(date);
        setModalVisible(true);
    };

    const openEventModal = (event) => {
        setSelectedEvent(event);
        setEventModalVisible(true);
    };

    const formatDate = (date) => {
        return moment(date).locale('es').format('dddd, D [de] MMMM');
    };

    const markedDates = events.reduce((acc, event) => {
        acc[event.date] = { marked: true, dotColor: 'green', textColor: 'green' };
        return acc;
    }, {});

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <Calendar
                            key={dark}
                            style={[styles.calendar, { borderColor: dark ? '#ccc' : '#ccc' }]}
                            onDayPress={(day) => {
                                const today = moment().startOf('day');
                                const selectedDay = moment(day.dateString).startOf('day');
                                if (selectedDay.isBefore(today)) {
                                    alert('No puedes agendar eventos en días que ya pasaron.');
                                    return;
                                }
                                openModal(day.dateString);
                            }}
                            markedDates={{
                                ...markedDates,
                                [selectedDate]: { selected: true, marked: true, selectedColor: colors.primary },
                            }}
                            theme={{
                                selectedDayBackgroundColor: colors.primary,
                                todayTextColor: colors.primary,
                                arrowColor: colors.primary,
                                backgroundColor: colors.background,
                                calendarBackground: colors.background,
                                textSectionTitleColor: colors.text,
                                monthTextColor: colors.text,
                                dayTextColor: colors.text,
                                textDisabledColor: colors.border,
                                dotColor: 'green',
                                selectedDotColor: 'green',
                                'stylesheet.calendar.header': {
                                    arrow: {
                                        padding: 10,
                                    },
                                    monthText: {
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        color: colors.text,
                                    },
                                },
                                'stylesheet.day.basic': {
                                    base: {
                                        width: 32,
                                        height: 32,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                    text: {
                                        marginTop: 6,
                                        fontSize: 16,
                                        color: colors.text,
                                    },
                                    today: {
                                        borderRadius: 16,
                                    },
                                    selected: {
                                        backgroundColor: colors.primary,
                                        borderRadius: 16,
                                    },
                                    marked: {
                                        dotColor: 'green',
                                        textColor: 'green',
                                    },
                                },
                            }}
                            renderArrow={(direction) => (
                                direction === 'left' ? <ChevronLeft size={30} color={colors.primary} /> : <ChevronRight size={30} color={colors.primary} />
                            )}
                            enableSwipeMonths={true}
                        />
                        <View style={[styles.dividerContainer, { backgroundColor: colors.card }]}>
                            <Text style={[styles.dividerText, { color: colors.text }]}>Tus próximos eventos</Text>
                        </View>
                    </>
                }
                data={events}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventItem}
                contentContainerStyle={styles.eventList}
            />
            <EventModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedDate('');
                    setEditingEvent(null);
                    setName('');
                    setDescription('');
                    setStartTime(new Date());
                }}
                onSave={handleCreateEvent}
                editingEvent={editingEvent}
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                startTime={startTime}
                setStartTime={setStartTime}
                showTimePicker={showTimePicker}
                setShowTimePicker={setShowTimePicker}
                colors={colors}
                styles={styles}
            />
            <ViewEventModal
                visible={eventModalVisible}
                onClose={() => setEventModalVisible(false)}
                selectedEvent={selectedEvent}
                temperatures={temperatures}
                formatDate={formatDate}
                colors={colors}
                styles={styles}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendar: {
        marginBottom: 10,
        borderWidth: 2,
    },
    dividerContainer: {
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    dividerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    eventList: {
        padding: 16,
    },
    eventDateHeader: {
        fontSize: 20,
        padding: 3,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    eventDateHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 3,
        marginBottom: 8,
    },
    weatherContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventTemperature: {
        fontSize: 14,
        marginRight: 8,
    },
    weatherIcon: {
        marginLeft: 8,
    },
    eventItem: {
        padding: 16,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    eventDescription: {
        fontSize: 14,
        marginVertical: 4,
    },
    eventTime: {
        fontSize: 14,
    },
    eventActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    editButtonContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    deleteButtonContainer: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        zIndex: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        padding: 10,
        marginVertical: 8,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ff4d4d',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EventScreen;