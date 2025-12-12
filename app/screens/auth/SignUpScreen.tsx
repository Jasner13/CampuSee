import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');
const DESIGN_HEIGHT = 896;
const DESIGN_WIDTH = 414;

const scaleY = (value: number) => (height / DESIGN_HEIGHT) * value;
const scaleX = (value: number) => (width / DESIGN_WIDTH) * value;

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const DEFAULT_GRADIENT_COLORS = ['#4F46E5', '#6366F1', '#8B5CF6'] as const;

function PrimaryButton({ onPress, disabled = false, style, children }: PrimaryButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[primaryButtonStyles.container, style]} activeOpacity={0.8}>
      <LinearGradient colors={DEFAULT_GRADIENT_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[primaryButtonStyles.gradient, disabled && primaryButtonStyles.disabled]}>
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const primaryButtonStyles = StyleSheet.create({
  container: { height: scaleY(64), borderRadius: scaleY(20), overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: scaleY(8) }, shadowOpacity: 0.4, shadowRadius: scaleY(10), elevation: 15 },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontSize: scaleY(20), fontWeight: '800' },
});

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validate Password Logic
  const validatePassword = (pwd: string) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
  });

  const passwordChecks = validatePassword(password);

  const validateEmail = (email: string) => {
    // Allows ONLY CIT institutional email: firstname.lastname@cit.edu
    const citRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@cit\.edu$/;
    return citRegex.test(email);
  };

  const handleCreateAccount = async () => {
    setMessage('');

    if (!email || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please use a valid CIT email (firstname.lastname@cit.edu).');
      return;
    }

    const allChecksPassed = Object.values(passwordChecks).every(c => c);
    if (!allChecksPassed) {
      setMessage('Please ensure your password meets all requirements.');
      return;
    }

    setLoading(true);
    const { error } = await signup(email, password);
    setLoading(false);

    if (error) {
      // Unify error handling
      setMessage(error.message);
    } else {
      navigation.navigate('CodeVerification', { email });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#667EEA', '#FFFFFF']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.background}>
        <TouchableOpacity style={[styles.backButton, { top: scaleY(64), left: scaleX(32) }]} onPress={handleBack} activeOpacity={0.8}>
          <View style={styles.backCircle}>
            <Svg width={scaleX(32)} height={scaleY(32)} viewBox="0 0 32 32" fill="none">
              <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>

        <View style={styles.contentWrapper}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Verify</Text>
          </View>
          <View style={styles.subheaderContainer}>
            <Text style={styles.subheaderText}>Your Student Status</Text>
          </View>

          {/* Top Error Display (System Log Style) */}
          <View style={styles.errorContainerWrapper}>
            {message ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#FF4136" />
                    <Text style={styles.messageText}>{message}</Text>
                </View>
            ) : null}
          </View>

          {/* Email */}
          <View style={[styles.fieldContainer, { marginTop: message ? scaleY(16) : scaleY(40) }]}>
            <Text style={styles.fieldLabel}>University Email</Text>
            <View style={styles.textFieldContainer}>
              <View style={styles.fieldContent}>
                <Svg width={scaleX(24)} height={scaleY(24)} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <TextInput
                  style={styles.textInput}
                  placeholder="firstname.lastname@cit.edu"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>

          {/* Password */}
          <View style={[styles.fieldContainer, { marginTop: scaleY(20) }]}>
            <Text style={styles.fieldLabel}>Create Password</Text>
            <View style={styles.textFieldContainer}>
              <View style={styles.fieldContent}>
                <Svg width={scaleX(24)} height={scaleY(24)} viewBox="0 0 24 24" fill="none">
                  <Path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="none"
                  autoCapitalize="none"
                  keyboardType="default"
                  autoComplete="off"
                  importantForAutofill="no"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Password Strength Identifiers - Fixed Layout */}
          <View style={styles.requirementsContainer}>
            <View style={styles.reqGrid}>
              <View style={styles.reqItem}>
                <Ionicons name={passwordChecks.length ? "checkmark-circle" : "ellipse-outline"} size={14} color={passwordChecks.length ? "#10B981" : "#E2E8F0"} />
                <Text style={[styles.reqText, passwordChecks.length && styles.reqMetText]}>8+ chars</Text>
              </View>
              <View style={styles.reqItem}>
                <Ionicons name={passwordChecks.uppercase ? "checkmark-circle" : "ellipse-outline"} size={14} color={passwordChecks.uppercase ? "#10B981" : "#E2E8F0"} />
                <Text style={[styles.reqText, passwordChecks.uppercase && styles.reqMetText]}>Uppercase</Text>
              </View>
              <View style={styles.reqItem}>
                <Ionicons name={passwordChecks.lowercase ? "checkmark-circle" : "ellipse-outline"} size={14} color={passwordChecks.lowercase ? "#10B981" : "#E2E8F0"} />
                <Text style={[styles.reqText, passwordChecks.lowercase && styles.reqMetText]}>Lowercase</Text>
              </View>
              <View style={styles.reqItem}>
                <Ionicons name={passwordChecks.number ? "checkmark-circle" : "ellipse-outline"} size={14} color={passwordChecks.number ? "#10B981" : "#E2E8F0"} />
                <Text style={[styles.reqText, passwordChecks.number && styles.reqMetText]}>Number</Text>
              </View>
            </View>
          </View>

          <View style={[styles.buttonContainer, { marginTop: scaleY(20) }]}>
            <PrimaryButton onPress={handleCreateAccount} disabled={loading} style={{ width: '100%' }}>
              <Text style={primaryButtonStyles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
            </PrimaryButton>
          </View>

          <View style={[styles.supplementalContainer, { marginTop: scaleY(10) }]}>
            <Text style={styles.supplementalText}>We'll send a verification link to your email to confirm your student status</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  contentWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingTop: scaleY(50), paddingBottom: scaleY(50) },
  backButton: { position: 'absolute', left: scaleX(32), width: scaleX(44), height: scaleY(44), zIndex: 10 },
  backCircle: { width: scaleX(44), height: scaleY(44), borderRadius: scaleY(22), backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerContainer: { width: '100%', paddingVertical: scaleY(6), justifyContent: 'center', alignItems: 'center', height: scaleY(56) },
  headerText: { color: '#FFFFFF', textAlign: 'center', fontSize: scaleY(32), fontWeight: '900', textShadowColor: 'rgba(0, 0, 0, 0.20)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  subheaderContainer: { width: '100%', paddingHorizontal: scaleX(100), paddingVertical: scaleY(5), justifyContent: 'center', alignItems: 'center', height: scaleY(33) },
  subheaderText: { color: '#FFFFFF', textAlign: 'center', fontSize: scaleY(18), fontWeight: '600' },
  errorContainerWrapper: { width: '100%', alignItems: 'center', marginTop: scaleY(20), paddingHorizontal: scaleX(45), minHeight: scaleY(30) },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 65, 54, 0.1)', paddingVertical: scaleY(8), paddingHorizontal: scaleX(16), borderRadius: scaleY(8), borderWidth: 1, borderColor: 'rgba(255, 65, 54, 0.3)', gap: scaleX(8) },
  messageText: { color: '#FF4136', textAlign: 'left', fontSize: scaleY(14), fontWeight: '700', flex: 1 },
  fieldContainer: { width: '100%', paddingHorizontal: scaleX(45), height: scaleY(92) },
  fieldLabel: { color: '#FFFFFF', fontSize: scaleY(15), fontWeight: '800', marginBottom: scaleY(8) },
  textFieldContainer: { width: '100%', height: scaleY(64), borderRadius: scaleY(12), borderWidth: scaleX(2), borderColor: '#D3DEE8', backgroundColor: '#FFFFFF', justifyContent: 'center' },
  fieldContent: { flexDirection: 'row', paddingHorizontal: scaleX(16), alignItems: 'center', gap: scaleX(12) },
  textInput: { flex: 1, color: '#64748B', fontFamily: 'Nunito Sans', fontSize: scaleY(18), fontWeight: '600', paddingVertical: 0, height: '100%' },
  buttonContainer: { width: '100%', paddingHorizontal: scaleX(40), height: scaleY(64) },
  supplementalContainer: { width: '100%', paddingHorizontal: scaleX(49), height: scaleY(44), justifyContent: 'center', alignItems: 'center' },
  supplementalText: { color: '#64748B', textAlign: 'center', fontSize: scaleY(14), fontWeight: '500', lineHeight: scaleY(20) },
  
  // Revised Requirements Styling
  requirementsContainer: { 
    width: '100%', 
    paddingHorizontal: scaleX(50), 
    marginTop: scaleY(8), 
    marginBottom: scaleY(10) 
  },
  reqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Ensure 2 columns evenly
    marginBottom: scaleY(4),
    gap: 6
  },
  reqText: { 
    color: '#E2E8F0', 
    fontSize: scaleY(13), 
    fontWeight: '600',
    opacity: 0.8
  },
  reqMetText: {
    color: '#10B981', // Green when met
    opacity: 1
  }
});