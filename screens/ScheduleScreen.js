import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Button, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSchedulesByDay, createSchedule } from '../components/Schedule';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ScheduleScreen() {
    const [schedules, setSchedules] = useState([]);
    const [expandedDays, setExpandedDays] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        name: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(),
        day: '',
    });
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const fetchSchedulesByDay = async (day) => {
        const schedules = await getSchedulesByDay(day);
        setSchedules(prevSchedules => ({
            ...prevSchedules,
            [day]: schedules,
        }));
    };

    const handleAddSchedule = async () => {
        const formattedSchedule = {
            ...newSchedule,
            startTime: formatTime(newSchedule.startTime),
            endTime: formatTime(newSchedule.endTime),
        };
        console.log('Datos del nuevo horario:', formattedSchedule); // Agregado para depuración
        await createSchedule(formattedSchedule);
        fetchSchedulesByDay(newSchedule.day);
        setNewSchedule({
            name: '',
            description: '',
            startTime: new Date(),
            endTime: new Date(),
            day: '',
        });
        setModalVisible(false);
    };

    const renderDay = ({ item: day }) => (
        <View>
            <TouchableOpacity onPress={() => {
                if (expandedDays.includes(day)) {
                    setExpandedDays(expandedDays.filter(d => d !== day));
                } else {
                    setExpandedDays([...expandedDays, day]);
                    fetchSchedulesByDay(day);
                }
            }}>
                <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{day}</Text>
                    <TouchableOpacity onPress={() => {
                        setNewSchedule({ ...newSchedule, day });
                        setModalVisible(true);
                    }}>
                        <Text style={styles.addButton}>+</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            {expandedDays.includes(day) && (
                <View style={styles.scheduleContainer}>
                    {schedules[day]?.map(schedule => (
                        <View key={schedule.id} style={styles.scheduleItem}>
                            <Text style={styles.scheduleName}>{schedule.name}</Text>
                            <Text style={styles.scheduleTime}>{`Desde: ${schedule.startTime} - Hasta: ${schedule.endTime}`}</Text>
                            <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const handleStartTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || newSchedule.startTime;
        setShowStartTimePicker(Platform.OS === 'ios');
        setNewSchedule({ ...newSchedule, startTime: currentDate });
    };

    const handleEndTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || newSchedule.endTime;
        setShowEndTimePicker(Platform.OS === 'ios');
        setNewSchedule({ ...newSchedule, endTime: currentDate });
    };

    const formatTime = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            return '';
        }
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Horarios</Text>
            <FlatList
                data={daysOfWeek}
                renderItem={renderDay}
                keyExtractor={(item) => item}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Añadir Horario</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            value={newSchedule.name}
                            onChangeText={(text) => setNewSchedule({ ...newSchedule, name: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Descripción"
                            value={newSchedule.description}
                            onChangeText={(text) => setNewSchedule({ ...newSchedule, description: text })}
                        />
                        <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                            <Text style={styles.input}>{`Desde: ${formatTime(newSchedule.startTime)}`}</Text>
                        </TouchableOpacity>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={newSchedule.startTime}
                                mode="time"
                                display="default"
                                onChange={handleStartTimeChange}
                            />
                        )}
                        <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                            <Text style={styles.input}>{`Hasta: ${formatTime(newSchedule.endTime)}`}</Text>
                        </TouchableOpacity>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={newSchedule.endTime}
                                mode="time"
                                display="default"
                                onChange={handleEndTimeChange}
                            />
                        )}
                        <View style={styles.buttonContainer}>
                            <Button title="Añadir Horario" onPress={handleAddSchedule} />
                            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: '#cdcdcd',
        borderWidth: 1,
        padding: 10,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    dayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        fontSize: 36,
        color: '#007AFF',
    },
    scheduleContainer: {
        padding: 10,
        backgroundColor: '#e9e9e9',
        borderRadius: 5,
        marginVertical: 8,
    },
    scheduleItem: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    scheduleName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scheduleTime: {
        fontSize: 16,
        color: '#555',
        marginVertical: 4,
    },
    scheduleDescription: {
        fontSize: 14,
        color: '#777',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
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
        borderColor: '#cdcdcd',
        borderWidth: 1,
        padding: 8,
        marginVertical: 8,
        width: '100%',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
});