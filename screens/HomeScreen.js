import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@react-navigation/native';

export default function HomeScreen() {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Valor inicial de opacidad

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const upcomingEvents = [
    { id: 1, title: 'Reunión de equipo', time: '10:00 AM', date: '2023-06-15' },
    { id: 2, title: 'Almuerzo con el profesor', time: '12:30 PM', date: '2023-06-15' },
    { id: 3, title: 'Entrega de proyecto', time: '5:00 PM', date: '2023-06-17' },
    { id: 4, title: 'Sesión de estudio en la biblioteca', time: '7:00 AM', date: '2023-06-18' },
  ];

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
          <Text style={[styles.eventsTitle, { color: colors.text }]}>Próximos Eventos</Text>
          {upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View>
                <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                <Text style={[styles.eventTime, { color: colors.text }]}>{event.time}</Text>
              </View>
              <Text style={[styles.eventDate, { color: colors.text }]}>{event.date}</Text>
            </View>
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
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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