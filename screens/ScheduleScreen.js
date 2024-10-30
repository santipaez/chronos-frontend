import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Button, Modal, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSchedulesByDay, createSchedule, updateSchedule, deleteSchedule } from '../components/Schedule';
import { Edit, Trash } from 'lucide-react-native';

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
    const [editingSchedule, setEditingSchedule] = useState(null);
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
        if (editingSchedule) {
            await updateSchedule(editingSchedule.id, formattedSchedule);
        } else {
            await createSchedule(formattedSchedule);
        }
        fetchSchedulesByDay(newSchedule.day);
        setNewSchedule({
            name: '',
            description: '',
            startTime: new Date(),
            endTime: new Date(),
            day: '',
        });
        setEditingSchedule(null);
        setModalVisible(false);
    };

    const handleEditSchedule = (schedule) => {
        setNewSchedule({
            name: schedule.name,
            description: schedule.description,
            startTime: new Date(`1970-01-01T${schedule.startTime}:00`), // Convertir a objeto Date
            endTime: new Date(`1970-01-01T${schedule.endTime}:00`), // Convertir a objeto Date
            day: schedule.day,
        });
        setEditingSchedule(schedule);
        setModalVisible(true);
    };

    const handleDeleteSchedule = async (scheduleId, day) => {
        await deleteSchedule(scheduleId);
        fetchSchedulesByDay(day);
    };

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

    const renderDay = ({ item: day }) => {
        const daySchedules = schedules[day] || [];
        const scheduleCount = daySchedules.length;
        const scheduleSummary = daySchedules.map(schedule => `${schedule.name}, ${schedule.startTime} a ${schedule.endTime}`).join('\n');
        const isExpanded = expandedDays.includes(day);

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => {
                    if (isExpanded) {
                        setExpandedDays(expandedDays.filter(d => d !== day));
                    } else {
                        setExpandedDays([...expandedDays, day]);
                        fetchSchedulesByDay(day);
                    }
                }}>
                    <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>{day} <Text style={styles.scheduleCount}>({scheduleCount})</Text></Text>
                        <TouchableOpacity onPress={() => {
                            setNewSchedule({ ...newSchedule, day });
                            setModalVisible(true);
                        }}>
                            <Text style={styles.addButton}>+</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                {!isExpanded && scheduleCount > 0 && (
                    <Text style={styles.scheduleSummary}>{scheduleSummary}</Text>
                )}
                {isExpanded && (
                    <View style={styles.scheduleContainer}>
                        {daySchedules.map(schedule => (
                            <View key={schedule.id} style={styles.scheduleItem}>
                                <View style={styles.scheduleActions}>
                                    <TouchableOpacity onPress={() => handleEditSchedule(schedule)}>
                                        <Edit size={24} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.scheduleName}>{schedule.name}</Text>
                                <Text style={styles.scheduleTime}>{`Desde: ${schedule.startTime} - Hasta: ${schedule.endTime}`}</Text>
                                <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                                <View style={styles.scheduleActions}>
                                    <TouchableOpacity onPress={() => handleDeleteSchedule(schedule.id, day)}>
                                        <Trash size={24} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={daysOfWeek}
                renderItem={renderDay}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Gestiona tus horarios</Text>
                    </View>
                )}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingSchedule ? 'Editar Horario' : 'Añadir Horario'}</Text>
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
                            <Button title={editingSchedule ? 'Guardar Cambios' : 'Añadir Horario'} onPress={handleAddSchedule} />
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        marginTop: 16,
    },
    scheduleItem: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    editButtonContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
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
    scheduleActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 0,
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
    scheduleSummary: {
        padding: 10,
        color: '#555',
        fontSize: 16,
    },
    scheduleCount: {
        color: '#888',
        fontSize: 14,
    },
});