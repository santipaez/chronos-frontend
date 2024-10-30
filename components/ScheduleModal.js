// chronos-frontend/components/ScheduleModal.js
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, Platform, Modal, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ScheduleModal = ({
    visible,
    onClose,
    onSave,
    editingSchedule,
    newSchedule,
    setNewSchedule,
    showStartTimePicker,
    setShowStartTimePicker,
    showEndTimePicker,
    setShowEndTimePicker,
    handleStartTimeChange,
    handleEndTimeChange,
    formatTime,
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
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{editingSchedule ? 'Editar Horario' : 'Añadir Horario'}</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                        placeholder="Nombre"
                        placeholderTextColor={colors.textSecondary}
                        value={newSchedule.name}
                        onChangeText={(text) => setNewSchedule({ ...newSchedule, name: text })}
                    />
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                        placeholder="Descripción"
                        placeholderTextColor={colors.textSecondary}
                        value={newSchedule.description}
                        onChangeText={(text) => setNewSchedule({ ...newSchedule, description: text })}
                    />
                    <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                        <Text style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}>{`Desde: ${formatTime(newSchedule.startTime)}`}</Text>
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
                        <Text style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}>{`Hasta: ${formatTime(newSchedule.endTime)}`}</Text>
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
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onSave}>
                            <Text style={styles.buttonText}>{editingSchedule ? 'Guardar Cambios' : 'Añadir Horario'}</Text>
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
});

export default ScheduleModal;