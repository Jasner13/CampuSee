import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Alert, 
  ActivityIndicator, 
  Dimensions,
  Modal,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import PrimaryButton from '../../components/buttons/PrimaryButton';

const { height } = Dimensions.get('window');

// --- CIT PROGRAMS DATA ---
const COLLEGE_PROGRAMS = [
  {
    title: 'College of Engineering and Architecture',
    data: [
      'BS Architecture',
      'BS Chemical Engineering',
      'BS Civil Engineering',
      'BS Computer Engineering',
      'BS Electrical Engineering',
      'BS Electronics Engineering',
      'BS Industrial Engineering',
      'BS Mechanical Engineering',
      'BS Mining Engineering',
    ],
  },
  {
    title: 'College of Management, Business & Accountancy',
    data: [
      'BS Accountancy',
      'BS Accounting Information Systems',
      'BS Management Accounting',
      'BS Business Administration',
      'BS Hospitality Management',
      'BS Tourism Management',
      'BS Office Administration',
    ],
  },
  {
    title: 'College of Arts, Sciences, & Education',
    data: [
      'AB Communication',
      'AB English with Applied Linguistics',
      'Bachelor of Elementary Education',
      'Bachelor of Secondary Education',
      'Bachelor of Multimedia Arts',
      'BS Biology',
      'BS Math with Applied Industrial Mathematics',
      'BS Psychology',
    ],
  },
  {
    title: 'College of Nursing & Allied Health Sciences',
    data: [
      'BS Nursing',
      'BS Pharmacy',
      'BS Medical Technology',
    ],
  },
  {
    title: 'College of Computer Studies',
    data: [
      'BS Computer Science',
      'BS Information Technology',
    ],
  },
  {
    title: 'College of Criminal Justice',
    data: ['BS Criminology'],
  },
];

export default function SetupProfileScreen() {
  const { session, refreshProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // --- SMART EMAIL PARSER ---
  useEffect(() => {
    if (session?.user?.email) {
      const email = session.user.email;
      const atIndex = email.indexOf('@');
      if (atIndex !== -1) {
        const parts = email.substring(0, atIndex).split(/[._]/);
        const formattedName = parts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        setName(formattedName);
      }
    }
  }, [session]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }
    if (!program) {
      Alert.alert('Missing Information', 'Please select your program.');
      return;
    }

    setLoading(true);

    try {
      if (!session?.user) throw new Error('No active session');

      const updates = {
        id: session.user.id,
        full_name: name.trim(),
        program: program,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      await refreshProfile();

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to filter sections based on search
  const getFilteredSections = () => {
    if (!searchText) return COLLEGE_PROGRAMS;
    
    return COLLEGE_PROGRAMS.map(section => ({
      ...section,
      data: section.data.filter(item => 
        item.toLowerCase().includes(searchText.toLowerCase())
      )
    })).filter(section => section.data.length > 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Let's get you set up!</Text>
          <Text style={styles.subtitle}>
            We pre-filled your name from your email.{'\n'}Feel free to change it.
          </Text>
        </View>

        <View style={styles.formContainer}>
          
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
          </View>

          {/* Program Selector Button */}
          <View style={styles.inputGroup}> 
            <Text style={styles.label}>Program</Text>
            <TouchableOpacity 
              style={styles.inputWrapper} 
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="school-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
              <Text style={[styles.inputText, !program && { color: COLORS.textTertiary }]}>
                {program || 'Select your program'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <PrimaryButton onPress={handleSave} disabled={loading} style={{ width: '100%' }}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Complete Setup</Text>}
            </PrimaryButton>
          </View>
        </View>

        {/* --- PROGRAM SELECTION MODAL --- */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet" // Nice card effect on iOS
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Program</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
               <Ionicons name="search" size={20} color={COLORS.textTertiary} style={{marginRight: 8}} />
               <TextInput 
                  style={styles.searchInput}
                  placeholder="Search program..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCorrect={false}
               />
            </View>

            <SectionList
              sections={getFilteredSections()}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.programItem, program === item && styles.programItemSelected]}
                  onPress={() => {
                    setProgram(item);
                    setModalVisible(false);
                    setSearchText('');
                  }}
                >
                  <Text style={[styles.programText, program === item && styles.programTextSelected]}>
                    {item}
                  </Text>
                  {program === item && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
              stickySectionHeadersEnabled={false}
            />
          </SafeAreaView>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: height * 0.05,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    height: '100%',
  },
  sectionHeader: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 10,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  programItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  programText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  programTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});