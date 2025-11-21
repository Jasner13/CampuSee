import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('John Lawrence Villamor');
  const [program, setProgram] = useState('BS Computer Engineering');
  const [bio, setBio] = useState('I love vibe coding, and femboys! love vibe coding, and femboys! love vibe coding, and femboys! love vibe coding, and femboys...');
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  const programs = [
    'BS Computer Engineering',
    'BS Computer Science',
    'BS Information Technology',
    'BS Software Engineering',
    'BS Information Systems',
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangePhoto = () => {
    // TODO: Implement image picker
    Alert.alert('Change Photo', 'Image picker functionality would go here');
  };

  const handleSaveChanges = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!program) {
      Alert.alert('Error', 'Please select a program');
      return;
    }

    // TODO: Implement actual profile update logic
    Alert.alert(
      'Success',
      'Your profile has been updated successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const selectProgram = (selectedProgram: string) => {
    setProgram(selectedProgram);
    setShowProgramDropdown(false);
  };

  const bioLength = bio.length;
  const maxBioLength = 200;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Profile</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JL</Text>
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
              placeholder="Enter your name"
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
            <Text style={styles.dropdownText}>{program}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* Dropdown Menu */}
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

        {/* Save Changes Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
          activeOpacity={0.8}
        >
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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