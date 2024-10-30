import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { getEvents, getSchedules } from '../API';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react-native';
import moment from 'moment';
import 'moment/locale/es';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCityFromCoords } from '../API';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function HomeScreen({ navigation }) {
  const { colors, dark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);

  const fetchSchedulesAndEvents = async () => {
    try {
      const schedulesData = await getSchedules();
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error al obtener los horarios:', error);
    }

    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSchedulesAndEvents();
    }, [])
  );

  useEffect(() => {
    fetchSchedulesAndEvents();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permiso de ubicación denegado');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const city = await fetchCityFromCoords(latitude, longitude);
      await AsyncStorage.setItem('@selected_city', JSON.stringify(city));
      await AsyncStorage.setItem('@coords', JSON.stringify({ latitude, longitude }));
    })();
  }, []);

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = { marked: true, dotColor: 'green', textColor: 'green' };
    return acc;
  }, {});

  const formatDate = (date) => {
    return moment(date).locale('es').format('dddd, D [de] MMMM');
  };

  const daysOfWeekOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const sortedSchedules = schedules.sort((a, b) => {
    return daysOfWeekOrder.indexOf(a.day) - daysOfWeekOrder.indexOf(b.day);
  });

  const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Calendar
          key={dark}
          style={[styles.calendar, { borderColor: dark ? '#ccc' : '#ccc' }]}
          markedDates={markedDates}
          onDayPress={(day) => {
            const event = events.find(e => e.date === day.dateString);
            if (event) {
              setSelectedEvent(event);
              setEventModalVisible(true);
            }
          }}
          renderArrow={(direction) => (
            direction === 'left' ? <ChevronLeft size={30} color={colors.primary} /> : <ChevronRight size={30} color={colors.primary} />
          )}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: colors.primary,
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
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={[styles.eventsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.eventsTitle, { color: colors.text }]}>Próximos Horarios</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Horarios')}>
              <Edit color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          {sortedSchedules.map((schedule) => (
            <TouchableOpacity
              key={schedule.id}
              style={styles.eventItem}
              activeOpacity={0.5}
            >
              <View>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{schedule.name}</Text>
                <Text style={[styles.eventTime, { color: colors.text }]}>{`De ${schedule.startTime} a ${schedule.endTime}`}</Text>
                <Text style={[styles.eventDate, { color: colors.text }]}>{`Todos los ${schedule.day}`}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={[styles.eventsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.eventsTitle, { color: colors.text }]}>Próximos Eventos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Agendar')}>
              <Edit color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          {sortedEvents.map((event) => (
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
                <Text style={[styles.eventTitle, { color: colors.text }]}>{event.name}</Text>
                <Text style={[styles.eventTime, { color: colors.text }]}>{event.startTime}</Text>
                <Text style={[styles.eventDate, { color: colors.text }]}>{formatDate(event.date)}</Text>
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
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            {selectedEvent && (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedEvent.name}</Text>
                <Text style={[styles.eventDescription, { color: colors.text }]}>{selectedEvent.description}</Text>
                <Text style={[styles.eventTime, { color: colors.text }]}>{selectedEvent.startTime}</Text>
                <Text style={[styles.eventDate, { color: colors.text }]}>{formatDate(selectedEvent.date)}</Text>
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
    width: '95%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 2,
  },
  divider: {
    height: 2,
    marginVertical: 20,
    width: '80%',
    alignSelf: 'center',
  },
  eventsContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 2,
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
    borderBottomColor: '#ccc',
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