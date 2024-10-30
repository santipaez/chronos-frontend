import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Modal, TouchableOpacity, Text, FlatList, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../components/Event';
import { Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/es'; // Importar el idioma español para moment.js

const EventScreen = ({ navigation }) => {
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

    useFocusEffect(
        React.useCallback(() => {
            fetchEvents();
            loadSettings();
        }, [])
    );

    const loadSettings = async () => {
        const storedDateFormat = await AsyncStorage.getItem('@date_format');
        if (storedDateFormat) {
            setDateFormat(storedDateFormat);
        }
    };

    const fetchEvents = async () => {
        try {
            const events = await getEvents();
            setEvents(events.sort((a, b) => new Date(a.date) - new Date(b.date)));
        } catch (error) {
            console.error('Error al obtener los eventos:', error);
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
            <Text style={styles.eventDateHeader}>{formatDate(item.date)}</Text>
            <View style={styles.eventItem}>
                <TouchableOpacity onPress={() => {
                    setEditingEvent(item);
                    setName(item.name);
                    setDescription(item.description);
                    setStartTime(new Date(`1970-01-01T${item.startTime}:00`));
                    setSelectedDate(item.date);
                    setModalVisible(true);
                }} style={styles.editButtonContainer}>
                    <Edit size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventDescription}>{item.description || 'Sin descripción'}</Text>
                <Text style={styles.eventTime}>{`A las: ${item.startTime}`}</Text>
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
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <Calendar
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
                                [selectedDate]: { selected: true, marked: true, selectedColor: '#00adf5' },
                            }}
                            theme={{
                                selectedDayBackgroundColor: '#00adf5',
                                todayTextColor: '#00adf5',
                                arrowColor: '#00adf5',
                                'stylesheet.calendar.header': {
                                    arrow: {
                                        padding: 10,
                                    },
                                    monthText: {
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        color: '#000000',
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
                                        color: '#2d4150',
                                    },
                                    today: {
                                        borderRadius: 16,
                                    },
                                    selected: {
                                        backgroundColor: '#00adf5',
                                        borderRadius: 16,
                                    },
                                    marked: {
                                        dotColor: 'green',
                                        textColor: 'green',
                                    },
                                },
                            }}
                            renderArrow={(direction) => (
                                direction === 'left' ? <ChevronLeft size={30} color="#00adf5" /> : <ChevronRight size={30} color="#00adf5" />
                            )}
                            enableSwipeMonths={true}
                        />
                        <View style={styles.dividerContainer}>
                            <Text style={styles.dividerText}>Tus próximos eventos</Text>
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
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{editingEvent ? 'Editar Evento' : 'Añadir Evento'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del evento"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Descripción"
                            value={description}
                            onChangeText={setDescription}
                        />
                        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.input}>{`Hora de inicio: ${startTime.toTimeString().substring(0, 5)}`}</Text>
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
                            <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
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
                    <View style={styles.modalView}>
                        {selectedEvent && (
                            <>
                                <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                                <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
                                <Text style={styles.eventTime}>{selectedEvent.startTime}</Text>
                                <Text style={styles.eventDate}>{formatDate(selectedEvent.date)}</Text>
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
        backgroundColor: '#f5f5f5',
    },
    dividerContainer: {
        padding: 16,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
    },
    dividerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    eventList: {
        padding: 16,
    },
    eventDateHeader: {
        fontSize: 20,
        padding: 3,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
    },
    eventItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
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
        color: '#555',
        marginVertical: 4,
    },
    eventTime: {
        fontSize: 14,
        color: '#777',
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
        backgroundColor: 'white',
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
        borderColor: '#cdcdcd',
        borderWidth: 1,
        padding: 10,
        marginVertical: 8,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    button: {
        backgroundColor: '#00adf5',
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