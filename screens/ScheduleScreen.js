import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Button, Modal, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getSchedulesByDay, createSchedule, updateSchedule, deleteSchedule } from '../components/Schedule';
import { Edit, Trash } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ScheduleScreen() {
    const { colors, dark } = useTheme();
    const [schedules, setSchedules] = useState({});
    const [expandedDay, setExpandedDay] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
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

    useEffect(() => {
        // Cargar horarios para todos los días al inicio
        daysOfWeek.forEach(day => {
            fetchSchedulesByDay(day);
        });
    }, []);

    const fetchSchedulesByDay = async (day) => {
        const daySchedules = await getSchedulesByDay(day);
        setSchedules(prevSchedules => ({
            ...prevSchedules,
            [day]: daySchedules,
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

    const handleDeleteSchedule = async () => {
        if (scheduleToDelete) {
            await deleteSchedule(scheduleToDelete.id);
            fetchSchedulesByDay(scheduleToDelete.day);
            setScheduleToDelete(null);
            setConfirmDeleteModalVisible(false);
        }
    };

    const confirmDeleteSchedule = (schedule) => {
        setScheduleToDelete(schedule);
        setConfirmDeleteModalVisible(true);
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
        const isExpanded = expandedDay === day;

        return (
            <View style={[styles.card, { backgroundColor: dark ? '#1c1b1b' : colors.card }]}>
                <TouchableOpacity onPress={() => {
                    setExpandedDay(isExpanded ? null : day);
                }}>
                    <View style={styles.dayHeader}>
                        <Text style={[styles.dayTitle, { color: colors.text }]}>{day} <Text style={styles.scheduleCount}>({scheduleCount})</Text></Text>
                        <TouchableOpacity onPress={() => {
                            setNewSchedule({ ...newSchedule, day });
                            setModalVisible(true);
                        }}>
                            <Text style={[styles.addButton, { color: colors.primary }]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                {!isExpanded && scheduleCount > 0 && (
                    <View>
                        {daySchedules.map((schedule, index) => (
                            <View key={schedule.id}>
                                <Text style={[styles.scheduleSummary, { color: colors.text }]}>{`${schedule.name}, ${schedule.startTime} a ${schedule.endTime}`}</Text>
                                {index < scheduleCount - 1 && <View style={[styles.divider, { borderBottomColor: dark ? '#fff' : '#ccc' }]} />}
                            </View>
                        ))}
                    </View>
                )}
                {isExpanded && (
                    <View style={styles.scheduleContainer}>
                        {scheduleCount === 0 ? (
                            <Text style={[styles.noSchedulesText, { color: colors.text }]}>No tienes horarios programados para este día.</Text>
                        ) : (
                            daySchedules.map(schedule => (
                                <View key={schedule.id} style={[styles.scheduleItem, { backgroundColor: dark ? '#2c2c2c' : colors.card }]}>
                                    <View style={styles.scheduleActions}>
                                        <TouchableOpacity onPress={() => handleEditSchedule(schedule)}>
                                            <Edit size={24} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={[styles.scheduleName, { color: colors.text }]}>{schedule.name}</Text>
                                    <Text style={[styles.scheduleTime, { color: colors.text }]}>{`Desde: ${schedule.startTime} - Hasta: ${schedule.endTime}`}</Text>
                                    <Text style={[styles.scheduleDescription, { color: dark ? '#fff' : colors.textSecondary }]}>{schedule.description}</Text>
                                    <View style={styles.scheduleActions}>
                                        <TouchableOpacity onPress={() => confirmDeleteSchedule(schedule)}>
                                            <Trash size={24} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={daysOfWeek}
                renderItem={renderDay}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Gestiona tus horarios</Text>
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
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{editingSchedule ? 'Editar Horario' : 'Añadir Horario'}</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Nombre"
                            placeholderTextColor={colors.textSecondary}
                            value={newSchedule.name}
                            onChangeText={(text) => setNewSchedule({ ...newSchedule, name: text })}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Descripción"
                            placeholderTextColor={colors.textSecondary}
                            value={newSchedule.description}
                            onChangeText={(text) => setNewSchedule({ ...newSchedule, description: text })}
                        />
                        <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                            <Text style={[styles.input, { color: colors.text, borderColor: colors.border }]}>{`Desde: ${formatTime(newSchedule.startTime)}`}</Text>
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
                            <Text style={[styles.input, { color: colors.text, borderColor: colors.border }]}>{`Hasta: ${formatTime(newSchedule.endTime)}`}</Text>
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmDeleteModalVisible}
                onRequestClose={() => setConfirmDeleteModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>¿Desea borrar este horario?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]} onPress={handleDeleteSchedule}>
                                <Text style={styles.buttonText}>Sí</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setConfirmDeleteModalVisible(false)}>
                                <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>
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
    },
    header: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    card: {
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 2,
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
    },
    scheduleContainer: {
        marginTop: 16,
    },
    scheduleItem: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
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
        marginVertical: 4,
    },
    scheduleDescription: {
        fontSize: 14,
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
        borderWidth: 1,
        padding: 8,
        marginVertical: 8,
        width: '100%',
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scheduleSummary: {
        padding: 10,
        fontSize: 16,
    },
    divider: {
        borderBottomWidth: 1,
        marginVertical: 5,
    },
    scheduleCount: {
        fontSize: 14,
    },
    noSchedulesText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
});