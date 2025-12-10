import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditProfileRouteProp>();
  const { session, refreshProfile } = useAuth();

  // Check if we are in "Setup Mode" (New User)
  const isNewUser = route.params?.isNewUser || false;

  // State for form fields
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [bio, setBio] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  const programs = [
    'BS Computer Engineering',
    'BS Computer Science',
    'BS Information Technology',
    'BS Software Engineering',
    'BS Information Systems',
  ];

  // 1. Fetch Profile Data on Mount
  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // If new user, data might be null/error, which is fine (fields stay empty)
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setName(data.full_name || '');
        setProgram(data.program || '');
        setBio(data.bio || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isNewUser) return; // Disable back for new users
    navigation.goBack();
  };

  const handleChangePhoto = () => {
    Alert.alert('Coming Soon', 'Photo upload will be implemented in the next sprint.');
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!program) {
      Alert.alert('Error', 'Please select a program');
      return;
    }

    try {
      setIsSaving(true);
      if (!session?.user) throw new Error('No user on the session!');

      // 2. Update (or Create) Profile in Supabase
      const updates = {
        id: session.user.id,
        full_name: name,
        program: program,
        bio: bio,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      // 3. CRITICAL: Refresh AuthContext to unlock AppNavigator
      await refreshProfile();

      if (!isNewUser) {
        Alert.alert('Success', 'Your profile has been updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // For new users, AppNavigator will automatically switch to "Main" 
        // once 'refreshProfile' updates the context.
      }

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const selectProgram = (selectedProgram: string) => {
    setProgram(selectedProgram);
    setShowProgramDropdown(false);
  };

  const bioLength = bio.length;
  const maxBioLength = 200;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        {/* Hide Back Button if Setup Mode */}
        {!isNewUser ? (
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.headerTitle}>
          {isNewUser ? 'Setup Profile' : 'Edit Profile'}
        </Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isNewUser && (
          <Text style={styles.setupSubtext}>
            Welcome! Please complete your profile to continue.
          </Text>
        )}

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangePhoto}
              activeOpacity={0.8}
            >
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>
        </View>

        {/* Program Dropdown */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Program</Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowProgramDropdown(!showProgramDropdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.inputIcon}>🎓</Text>
            <Text style={styles.dropdownText}>{program || 'Select Program'}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {showProgramDropdown && (
            <View style={styles.dropdownMenu}>
              {programs.map((prog, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    prog === program && styles.dropdownItemSelected
                  ]}
                  onPress={() => selectProgram(prog)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    prog === program && styles.dropdownItemTextSelected
                  ]}>
                    {prog}
                  </Text>
                  {prog === program && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bio Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Bio</Text>
          <View style={styles.textAreaContainer}>
            <Text style={styles.textAreaIcon}>☰</Text>
            <TextInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              maxLength={maxBioLength}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.bioFooter}>
            <Text style={styles.bioHint}>
              Tip: Clubs, interests, campus favorites
            </Text>
            <Text style={[
              styles.bioCounter,
              bioLength > maxBioLength * 0.9 && styles.bioCounterWarning
            ]}>
              {bioLength}/{maxBioLength}
            </Text>
          </View>
        </View>

        {/* Save/Complete Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          onPress={handleSaveChanges}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.saveButtonText}>
                {isNewUser ? 'Complete Setup' : 'Save Changes'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  setupSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  cameraIcon: {
    fontSize: 18,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  dropdownMenu: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.primary,
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 120,
  },
  textAreaIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bioHint: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  bioCounter: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bioCounterWarning: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  checkIcon: {
    fontSize: 18,
    color: COLORS.textLight,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});