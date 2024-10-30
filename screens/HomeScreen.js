import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTheme } from '@react-navigation/native';
import { getSchedules } from '../components/Schedule';
import { getEvents } from '../components/Event';
import { Edit, Trash } from 'lucide-react-native';
import moment from 'moment';
import 'moment/locale/es'; // Importar el idioma español para moment.js

// Configurar la localización en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);

  useEffect(() => {
    getSchedules()
      .then(data => setSchedules(data))
      .catch(error => {
        console.error('Error al obtener los horarios:', error);
      });

    getEvents()
      .then(data => setEvents(data))
      .catch(error => {
        console.error('Error al obtener los eventos:', error);
      });

    // Ejecutar la animación de desvanecimiento
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = { marked: true, dotColor: 'green', textColor: 'green' };
    return acc;
  }, {});

  const formatDate = (date) => {
    return moment(date).locale('es').format('dddd, D [de] MMMM');
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Calendar
          style={styles.calendar}
          markedDates={markedDates}
          onDayPress={(day) => {
            const event = events.find(e => e.date === day.dateString);
            if (event) {
              setSelectedEvent(event);
              setEventModalVisible(true);
            }
          }}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: colors.text,
            textDisabledColor: colors.border,
          }}
        />
        <View style={styles.divider} />
        <View style={[styles.eventsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.eventsTitle, { color: colors.text }]}>Próximos Horarios</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Horarios')}>
              <Edit color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          {schedules.map((schedule) => (
            <TouchableOpacity
              key={schedule.id}
              style={styles.eventItem}
              activeOpacity={0.5}
            >
              <View>
                <Text style={styles.eventTitle}>{schedule.name}</Text>
                <Text style={[styles.eventTime, { color: colors.textSecondary }]}>De {schedule.startTime} a {schedule.endTime}</Text>
                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>Todos los {schedule.day}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider} />
        <View style={[styles.eventsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.eventsTitle, { color: colors.text }]}>Próximos Eventos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Agendar')}>
              <Edit color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          {events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventItem}
              activeOpacity={0.5}
              onPress={() => {
                setSelectedEvent(event);
                setEventModalVisible(true);
              }}
            >
              <View>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{event.startTime}</Text>
                <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{formatDate(event.date)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  calendar: {
    marginBottom: 10,
  },
  divider: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
    width: '80%',
    alignSelf: 'center',
  },
  eventsContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 14,
  },
  eventDate: {
    fontSize: 14,
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
  eventDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
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
  },
});