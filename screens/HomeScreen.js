import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTheme } from '@react-navigation/native';
import { getSchedules } from '../components/Schedule';
import { Edit } from 'lucide-react-native';

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

  useEffect(() => {
    getSchedules()
      .then(data => setSchedules(data))
      .catch(error => {
        console.error('Error al obtener los horarios:', error);
      });

    // Ejecutar la animación de desvanecimiento
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Calendar
          style={styles.calendar}
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
                <Text style={styles.eventTime}>{schedule.startTime} - {schedule.endTime}</Text>
                <Text style={styles.eventDate}>{schedule.day}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
});