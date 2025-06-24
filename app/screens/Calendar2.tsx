import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Link, useRouter } from 'expo-router';
import { AntDesign, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';

interface Session {
  id: number;
  time: string;
  student: string;
  date: string;
}

export default function CalendarScreen(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState<string>('2025-06-03');
  
  // Format the date for display
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Simulated session data - would come from your API
  const sessions: Session[] = [
    { id: 1, time: '12:00 - 1:00 PM', student: 'Alan Honor', date: '2025-06-03' },
    { id: 2, time: '3:00 - 4:00 PM', student: 'Jeff Watts', date: '2025-06-03' },
    { id: 3, time: '4:00 - 5:00 PM', student: 'Tim Hardy', date: '2025-06-03' },
  ];
  
  // Filter sessions for the selected date
  const sessionsForSelectedDate = sessions.filter(session => 
    session.date === selectedDate
  );
  
  // Custom rendering for calendar day
  const getCustomDayStyle = (date: string) => {
    if (date === selectedDate) {
      return {
        container: styles.selectedDayContainer,
        text: styles.selectedDayText
      };
    }
    return {};
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Month and navigation */}
      <View style={styles.header}>
        <Text style={styles.monthYearText}>{formatDisplayDate(selectedDate)}</Text>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton}>
            <AntDesign name="left" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <AntDesign name="right" size={24} color="#D4AF37" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markingType={'custom'}
          markedDates={{
            [selectedDate]: { 
              selected: true,
              customStyles: getCustomDayStyle(selectedDate)
            }
          }}
          theme={{
            calendarBackground: '#000',
            textSectionTitleColor: '#D4AF37',
            selectedDayBackgroundColor: '#D4AF37',
            selectedDayTextColor: '#000',
            todayTextColor: '#D4AF37',
            dayTextColor: '#D4AF37',
            textDisabledColor: '#444',
            monthTextColor: '#D4AF37'
          }}
        />
      </View>
      
      {/* Schedule Section */}
      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>Schedule</Text>
        {sessionsForSelectedDate.length > 0 ? (
          sessionsForSelectedDate.map(session => (
            <View key={session.id} style={styles.sessionCard}>
              <Text style={styles.sessionText}>
                {session.time} {session.student}
              </Text>
              <TouchableOpacity 
                style={styles.viewButton}
              >
                <Text style={styles.viewButtonText}>VIEW</Text>
                <AntDesign name="arrowright" size={24} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noSessionsText}>No sessions scheduled for this date</Text>
        )}
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Link href="/" asChild>
          <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
            <MaterialIcons name="calendar-today" size={28} color="#D4AF37" />
            <Text style={styles.activeNavText}>CALENDAR</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="check-square" size={28} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  monthYearText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  navButtons: {
    flexDirection: 'row',
  },
  navButton: {
    marginLeft: 16,
  },
  calendarContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    margin: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  selectedDayContainer: {
    backgroundColor: '#D4AF37',
    borderRadius: 0,
  },
  selectedDayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 16,
  },
  scheduleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  noSessionsText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  activeNavItem: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 8,
    paddingHorizontal: 16,
  },
  activeNavText: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
});
