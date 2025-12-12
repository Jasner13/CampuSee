import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  DimensionValue, // Imported DimensionValue
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// --- Dynamic Layout Helpers ---
const { height, width } = Dimensions.get('window');
const DESIGN_HEIGHT = 896;
const DESIGN_WIDTH = 414;

const scaleY = (value: number) => (height / DESIGN_HEIGHT) * value;
const scaleX = (value: number) => (width / DESIGN_WIDTH) * value;

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  // --- Validation Logic ---
  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
  };

  const passwordChecks = validatePassword(newPassword);
  const allChecksPassed = Object.values(passwordChecks).every((check) => check);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const getPasswordStrength = () => {
    const passedChecks = Object.values(passwordChecks).filter((check) => check).length;
    // Cast widths as DimensionValue to fix the TypeScript error
    if (passedChecks === 4) return { label: 'Strong', color: COLORS.success, width: '100%' as DimensionValue };
    if (passedChecks >= 2) return { label: 'Medium', color: '#F59E0B', width: '66%' as DimensionValue };
    return { label: 'Weak', color: '#EF4444', width: '33%' as DimensionValue };
  };

  const strength = getPasswordStrength();

  // --- Handlers ---
  const handleSaveChanges = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }

    if (!allChecksPassed) {
      Alert.alert('Weak Password', 'Please meet all password requirements.');
      return;
    }

    if (!passwordsMatch) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    if (!session?.user?.email) {
      Alert.alert('Error', 'User session not found.');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Verify Current Password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Incorrect Password', 'The current password you entered is incorrect.');
        setIsLoading(false);
        return;
      }

      // 2. Update to New Password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      Alert.alert('Success', 'Your password has been changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderRequirement = (met: boolean, text: string) => (
    <View style={styles.requirementItem}>
      <Ionicons 
        name={met ? "checkmark-circle" : "ellipse-outline"} 
        size={16} 
        color={met ? COLORS.success : COLORS.textTertiary} 
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </Text>
    </View>
  );

  const LockIcon = () => (
    <Svg width={scaleX(24)} height={scaleY(24)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
        stroke={COLORS.textSecondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
        stroke={COLORS.textSecondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={handleBack}
          >
             <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#059669" style={{ marginRight: 12 }} />
            <Text style={styles.infoText}>
              Create a strong password that you don't use for other websites.
            </Text>
          </View>

          {/* Current Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.textField}>
              <View style={styles.fieldContent}>
                <LockIcon />
                <TextInput
                  style={styles.textInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.textField}>
              <View style={styles.fieldContent}>
                <LockIcon />
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBg}>
                  <View 
                    style={[
                      styles.strengthBarFill, 
                      { backgroundColor: strength.color, width: strength.width }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            {/* Requirements List */}
            <View style={styles.requirementsContainer}>
                {renderRequirement(passwordChecks.length, "At least 8 characters")}
                {renderRequirement(passwordChecks.uppercase, "One uppercase letter")}
                {renderRequirement(passwordChecks.lowercase, "One lowercase letter")}
                {renderRequirement(passwordChecks.number, "One number")}
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={[
                styles.textField, 
                confirmPassword.length > 0 && (passwordsMatch ? styles.borderSuccess : styles.borderError)
            ]}>
              <View style={styles.fieldContent}>
                <LockIcon />
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {confirmPassword.length > 0 && (
                 <Text style={[styles.matchText, { color: passwordsMatch ? COLORS.success : COLORS.error }]}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                 </Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButtonShadow, { marginTop: 20 }]}
            onPress={handleSaveChanges}
            disabled={isLoading || !allChecksPassed || !passwordsMatch}
            activeOpacity={0.8}
          >
            <LinearGradient
                colors={
                    (!allChecksPassed || !passwordsMatch || !currentPassword) 
                    ? [COLORS.textTertiary, COLORS.textTertiary] // Disabled state
                    : ['#4F46E5', '#6366F1', '#8B5CF6'] // Primary Gradient
                } 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Nunito Sans' : 'sans-serif',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Nunito Sans' : 'sans-serif',
  },
  textField: {
    width: '100%',
    height: scaleY(64),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.faintGray,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  borderSuccess: {
      borderColor: COLORS.success,
  },
  borderError: {
      borderColor: COLORS.error,
  },
  fieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'Nunito Sans' : 'sans-serif',
  },
  
  // Strength Meter
  strengthContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 12,
  },
  strengthBarBg: {
      flex: 1,
      height: 6,
      backgroundColor: COLORS.border,
      borderRadius: 3,
      overflow: 'hidden',
  },
  strengthBarFill: {
      height: '100%',
      borderRadius: 3,
  },
  strengthText: {
      fontSize: 12,
      fontWeight: '700',
      minWidth: 50,
      textAlign: 'right',
  },

  // Requirements
  requirementsContainer: {
      marginTop: 16,
      gap: 8,
  },
  requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  requirementText: {
      fontSize: 13,
      color: COLORS.textSecondary,
  },
  requirementMet: {
      color: COLORS.success,
      fontWeight: '600',
  },
  matchText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
      marginLeft: 4,
  },

  // Button Styles
  saveButtonShadow: {
    height: scaleY(64),
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Nunito Sans' : 'sans-serif',
  },
});