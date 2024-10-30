import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, TouchableOpacity, Text, FlatList, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../components/Event';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/es'; // Importar el idioma español para moment.js
import { requestNotificationPermissions, scheduleNotification } from '../notifications';
import { API_WEATHER } from '../config';

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
            requestNotificationPermissions(); // Solicitar permisos de notificación
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

    const fetchTemperature = async (date) => {
        try {
            const storedCity = await AsyncStorage.getItem('@selected_city');
            const city = storedCity ? JSON.parse(storedCity).name : 'YOUR_DEFAULT_CITY';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_WEATHER}&units=metric`);
            const data = await response.json();
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
    };
    
    const fetchTemperatures = async (events) => {
        const newTemperatures = {};
        for (const event of events) {
            const tempData = await fetchTemperature(event.date);
            newTemperatures[event.date] = tempData;
        }
        setTemperatures(newTemperatures);
    };
    
    const getWeatherIcon = (weather) => {
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
            setSelectedDate(''); // Restablecer la fecha seleccionada
            fetchEvents(); // Refrescar la lista de eventos

            // Programar notificación
            const eventDateTime = new Date(`${selectedDate}T${startTime.toTimeString().substring(0, 5)}:00`);
            const notificationDateTime = new Date(eventDateTime.getTime() - notificationHours * 60 * 60 * 1000); // Horas antes configuradas
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
            fetchEvents(); // Refrescar la lista de eventos
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

    const renderEventItem = ({ item }) => (
        <View>
            <View style={styles.eventDateHeaderContainer}>
                <Text style={[styles.eventDateHeader, { color: colors.primary}]}>{formatDate(item.date)}</Text>
                <View style={styles.weatherContainer}>
                    {temperatures[item.date]?.temp !== null && temperatures[item.date]?.temp !== undefined && (
                        <>
                            <Text style={[styles.eventTemperature, { color: colors.primary, fontWeight: 'bold'}]}>
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

    const markedDates = events.reduce((acc, event) => {
        acc[event.date] = { marked: true, dotColor: 'green', textColor: 'green' };
        return acc;
    }, {});

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <Calendar
                            key={dark} // Forzar re-renderización cuando cambie el tema
                            style={[styles.calendar, { borderColor: dark ? '#ccc' : '#ccc' }]} // Añadir estilo aquí
                            onDayPress={(day) => {
                                const today = moment().startOf('day');
                                const selectedDay = moment(day.dateString).startOf('day');
                                if (selectedDay.isBefore(today)) {
                                    alert('No puedes agendar eventos en días que ya pasaron.');
                                    return;
                                }
                                const event = events.find(e => e.date === day.dateString);
                                if (event) {
                                    openEventModal(event);
                                } else {
                                    openModal(day.dateString);
                                }
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setSelectedDate(''); // Restablecer la fecha seleccionada
                    setEditingEvent(null);
                    setName('');
                    setDescription('');
                    setStartTime(new Date());
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{editingEvent ? 'Editar Evento' : 'Añadir Evento'}</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                            placeholder="Nombre del evento"
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                            placeholder="Descripción"
                            placeholderTextColor={colors.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                        />
                        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                            <Text style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}>{`Hora de inicio: ${startTime.toTimeString().substring(0, 5)}`}</Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowTimePicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setStartTime(selectedDate);
                                    }
                                }}
                            />
                        )}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleCreateEvent}>
                                <Text style={styles.buttonText}>{editingEvent ? 'Guardar Cambios' : 'Crear Evento'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => {
                                setModalVisible(false);
                                setSelectedDate(''); // Restablecer la fecha seleccionada
                                setEditingEvent(null);
                                setName('');
                                setDescription('');
                                setStartTime(new Date());
                            }}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={eventModalVisible}
                onRequestClose={() => setEventModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                        {selectedEvent && (
                            <>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedEvent.name}</Text>
                                <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>{selectedEvent.description}</Text>
                                <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{selectedEvent.startTime}</Text>
                                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{formatDate(selectedEvent.date)}</Text>
                                <Text style={[styles.eventTemperature, { color: colors.textSecondary }]}>{`Temperatura: ${temperatures[selectedEvent.date] || 'Cargando...'}°C`}</Text>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEventModalVisible(false)}>
                                    <Text style={styles.buttonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendar: {
        marginBottom: 10,
        borderWidth: 2, // Añadir borde
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
    eventTemperature: {
        fontSize: 14,
        marginVertical: 4,
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