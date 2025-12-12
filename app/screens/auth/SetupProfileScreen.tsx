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
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import PrimaryButton from '../../components/buttons/PrimaryButton';

const { height } = Dimensions.get('window');

const PROGRAMS = [
  'BS Computer Engineering',
  'BS Computer Science',
  'BS Information Technology',
  'BS Software Engineering',
  'BS Information Systems',
  'BS Civil Engineering',
  'BS Architecture',
];

export default function SetupProfileScreen() {
  const { session, refreshProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- SMART EMAIL PARSER ---
  // Runs once to suggest a name from the email
  useEffect(() => {
    if (session?.user?.email) {
      const email = session.user.email;
      const atIndex = email.indexOf('@');
      if (atIndex !== -1) {
        // "john.doe" -> ["john", "doe"]
        const parts = email.substring(0, atIndex).split(/[._]/);
        
        // "John Doe"
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

      // CRITICAL: Refresh context so AppNavigator redirects to Home
      await refreshProfile();

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
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
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={COLORS.textSecondary} 
                style={styles.icon} 
              />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
          </View>

          {/* Program Dropdown */}
          <View style={[styles.inputGroup, { zIndex: 10 }]}> 
            <Text style={styles.label}>Program</Text>
            <TouchableOpacity 
              style={styles.inputWrapper} 
              onPress={() => setShowDropdown(!showDropdown)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="school-outline" 
                size={20} 
                color={COLORS.textSecondary} 
                style={styles.icon} 
              />
              <Text style={[styles.inputText, !program && { color: COLORS.textTertiary }]}>
                {program || 'Select your program'}
              </Text>
              <Ionicons 
                name={showDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdown}>
                {PROGRAMS.map((prog, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setProgram(prog);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText, 
                      program === prog && { color: COLORS.primary, fontWeight: '700' }
                    ]}>
                      {prog}
                    </Text>
                    {program === prog && (
                      <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <PrimaryButton onPress={handleSave} disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Complete Setup</Text>
              )}
            </PrimaryButton>
          </View>
        </View>

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
    position: 'relative',
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
  dropdown: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownText: {
    fontSize: 15,
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
});