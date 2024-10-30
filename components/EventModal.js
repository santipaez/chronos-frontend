import React from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform, Modal, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const EventModal = ({
    visible,
    onClose,
    onSave,
    editingEvent,
    name,
    setName,
    description,
    setDescription,
    startTime,
    setStartTime,
    showTimePicker,
    setShowTimePicker,
    colors
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
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
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onSave}>
                            <Text style={styles.buttonText}>{editingEvent ? 'Guardar Cambios' : 'Crear Evento'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const ViewEventModal = ({ visible, onClose, selectedEvent, temperatures, formatDate, colors, styles }) => {
    if (!selectedEvent) {
        return null;
    }

    const temperature = temperatures[selectedEvent.date] && typeof temperatures[selectedEvent.date].temp === 'number'
        ? `${Math.round(temperatures[selectedEvent.date].temp)}°C`
        : 'Cargando...';

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                    {selectedEvent && (
                        <>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Detalles del evento</Text>
                            <Text style={[styles.eventName, { color: colors.text }]}>{selectedEvent.name}</Text>
                            <Text style={[styles.eventDescription, { color: colors.textSecondary, marginVertical: 8 }]}>{selectedEvent.description}</Text>
                            <Text style={[styles.eventTime, { color: colors.textSecondary, marginVertical: 8 }]}>{selectedEvent.startTime}</Text>
                            <Text style={[styles.eventDate, { color: colors.textSecondary, marginVertical: 8 }]}>{formatDate(selectedEvent.date)}</Text>
                            <Text style={[styles.eventTemperature, { color: colors.textSecondary, marginVertical: 8 }]}>{`Temperatura: ${temperature}`}</Text>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                <Text style={styles.buttonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
    eventDate: {
        fontSize: 14,
    },
    eventTemperature: {
        fontSize: 14,
        marginVertical: 8,
    },
});