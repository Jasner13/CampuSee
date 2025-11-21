import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
    return checks;
  };

  const passwordChecks = validatePassword(newPassword);
  const allChecksPassed = Object.values(passwordChecks).every(check => check);

  const getPasswordStrength = () => {
    const passedChecks = Object.values(passwordChecks).filter(check => check).length;
    if (passedChecks === 4) return 'Strong';
    if (passedChecks >= 2) return 'Medium';
    return 'Weak';
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength === 'Strong') return COLORS.success;
    if (strength === 'Medium') return '#F59E0B';
    return '#EF4444';
  };

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSaveChanges = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!allChecksPassed) {
      Alert.alert('Error', 'Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // TODO: Implement actual password change logic
    Alert.alert(
      'Success',
      'Your password has been changed successfully. You will be logged out of all devices.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Change Password</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            For your Security, choose a strong password that you haven't used elsewhere. You'll be logged out of all devices after changing your password
          </Text>
        </View>

        {/* Current Password */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={COLORS.textTertiary}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={COLORS.textTertiary}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Password Strength */}
          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Password Strength: </Text>
              <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                {getPasswordStrength()}
              </Text>
            </View>
          )}

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <View style={styles.requirementsContainer}>
              <View style={styles.requirementItem}>
                <Text style={passwordChecks.length ? styles.checkmark : styles.bullet}>
                  {passwordChecks.length ? '✓' : '•'}
                </Text>
                <Text style={[styles.requirementText, passwordChecks.length && styles.requirementMet]}>
                  At least 8 characters
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Text style={passwordChecks.uppercase ? styles.checkmark : styles.bullet}>
                  {passwordChecks.uppercase ? '✓' : '•'}
                </Text>
                <Text style={[styles.requirementText, passwordChecks.uppercase && styles.requirementMet]}>
                  One uppercase letter
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Text style={passwordChecks.lowercase ? styles.checkmark : styles.bullet}>
                  {passwordChecks.lowercase ? '✓' : '•'}
                </Text>
                <Text style={[styles.requirementText, passwordChecks.lowercase && styles.requirementMet]}>
                  One lowercase letter
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Text style={passwordChecks.number ? styles.checkmark : styles.bullet}>
                  {passwordChecks.number ? '✓' : '•'}
                </Text>
                <Text style={[styles.requirementText, passwordChecks.number && styles.requirementMet]}>
                  One number
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Confirm New Password */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={COLORS.textTertiary}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <View style={styles.matchContainer}>
              <Text style={passwordsMatch ? styles.matchText : styles.noMatchText}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            </View>
          )}
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!allChecksPassed || !passwordsMatch || !currentPassword) && styles.saveButtonDisabled
          ]}
          onPress={handleSaveChanges}
          activeOpacity={0.8}
          disabled={!allChecksPassed || !passwordsMatch || !currentPassword}
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
  infoBanner: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#059669',
    lineHeight: 20,
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
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  strengthText: {
    fontSize: 13,
    fontWeight: '600',
  },
  requirementsContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bullet: {
    fontSize: 16,
    color: COLORS.textTertiary,
    marginRight: 8,
    width: 16,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.success,
    marginRight: 8,
    width: 16,
  },
  requirementText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  requirementMet: {
    color: COLORS.success,
    fontWeight: '500',
  },
  matchContainer: {
    marginTop: 8,
  },
  matchText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  noMatchText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
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
  saveButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
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