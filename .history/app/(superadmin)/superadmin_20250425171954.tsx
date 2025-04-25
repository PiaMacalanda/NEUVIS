import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  GestureResponderEvent
} from 'react-native';
import Header from "../../components/Header";
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Admin = () => {
  const router = useRouter();
  const navigation = useNavigation();
  
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <StatusBar barStyle="light-content" backgroundColor="#252525" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* Admin Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Hello Super Admin</Text>
          <Text style={styles.welcomeSubtitle}>Welcome to NEUVIS Super Administration</Text>
        </View>

        {/* Admin Dashboard Cards */}
        <View style={styles.cardsContainer}>
          <TouchableCard 
            icon="create-outline" 
            title="Create Admin"
            onPress={() => router.push('./admin-create')} 
          />
          <TouchableCard 
            icon="create-outline" 
            title="Transfer Superadmin"
            onPress={() => router.push('./transfer_superadmin')} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// Define TypeScript interface for TouchableCard props
interface TouchableCardProps {
   icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: (event: GestureResponderEvent) => void;
}

// TouchableCard Component with proper TypeScript types
const TouchableCard: React.FC<TouchableCardProps> = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={26} color="#252525" />
      </View>
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );
};

// Enhanced Styles with improved spacing and margins
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 14,
    color: '#252525',
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: '#252525',
    marginTop: 6,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    height: 120,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardText: {
    color: '#252525',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 40,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#444',
    flex: 1,
    lineHeight: 20,
  },
});

export default Admin;