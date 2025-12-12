import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { Svg, Path } from 'react-native-svg';

const { height, width } = Dimensions.get('window');
const DESIGN_HEIGHT = 896;
const DESIGN_WIDTH = 414;

const scaleY = (value: number) => (height / DESIGN_HEIGHT) * value;
const scaleX = (value: number) => (width / DESIGN_WIDTH) * value;

type CodeVerificationScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'CodeVerification'>;
type CodeVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'CodeVerification'>;

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const DEFAULT_GRADIENT_COLORS = ['#4F46E5', '#6366F1', '#8B5CF6'] as const;

function PrimaryButton({
  onPress,
  disabled = false,
  style,
  children
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[primaryButtonStyles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={DEFAULT_GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[primaryButtonStyles.gradient, disabled && primaryButtonStyles.disabled]}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const primaryButtonStyles = StyleSheet.create({
  container: {
    height: scaleY(64),
    borderRadius: scaleY(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleY(8) },
    shadowOpacity: 0.4,
    shadowRadius: scaleY(10),
    elevation: 15,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: scaleY(20),
    fontWeight: '800',
  },
});

export default function CodeVerificationScreen() {
  const navigation = useNavigation<CodeVerificationScreenNavigationProp>();
  const route = useRoute<CodeVerificationScreenRouteProp>();

  // Get resendOtp from context
  const { verifyOtp, resendOtp } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // UPDATE: Countdown Logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyAccount = async () => {
    setMessage('');
    const fullCode = code.join('');

    if (fullCode.length === 6) {
      setLoading(true);
      const { error } = await verifyOtp(route.params.email, fullCode);
      setLoading(false);

      if (error) {
        setMessage(error.message);
      } else {
        console.log('Verification successful');
      }
    } else {
      setMessage('Please enter the full 6-digit code');
    }
  };

  // UPDATE: Resend Logic
  const handleResend = async () => {
    if (!canResend) return;

    // Reset timer immediately to prevent spam
    setCanResend(false);
    setTimeLeft(30);
    setMessage('');

    const { error } = await resendOtp(route.params.email);

    if (error) {
      Alert.alert('Error', error.message);
      // Optional: don't reset timer on error? 
      // For security, usually better to keep the cooldown anyway.
    } else {
      Alert.alert('Sent!', 'A new code has been sent to your email.');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667EEA', '#FFFFFF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.background}
      >
        <TouchableOpacity
          style={[styles.backButton, { top: scaleY(64), left: scaleX(32) }]}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <View style={styles.backCircle}>
            <Svg width={scaleX(32)} height={scaleY(32)} viewBox="0 0 32 32" fill="none">
              <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>

        <View style={styles.contentWrapper}>

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Enter Verification Code</Text>
          </View>

          <View style={styles.subheaderContainer}>
            <Text style={styles.subheaderText}>We sent a 6-digit code to</Text>
            <Text style={styles.emailText}>{route.params.email}</Text>
          </View>

          <View style={[styles.otpContainer, { marginTop: scaleY(64) }]}>
            <View style={styles.otpBoxes}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    code[index] ? styles.otpBoxFilled : styles.otpBoxEmpty,
                    inputRefs.current[index]?.isFocused() && styles.otpBoxActive,
                  ]}
                >
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={styles.otpInput}
                    value={code[index]}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>
          </View>

          {message ? (
            <Text style={[styles.messageText, {
              marginTop: scaleY(20),
              paddingHorizontal: scaleX(45)
            }]}>{message}</Text>
          ) : null}

          <View style={[styles.buttonContainer, { marginTop: message ? scaleY(24) : scaleY(32) }]}>
            <PrimaryButton
              onPress={handleVerifyAccount}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <Text style={primaryButtonStyles.buttonText}>
                {loading ? 'Verifying...' : 'Verify Account'}
              </Text>
            </PrimaryButton>
          </View>

          <View style={[styles.supplementalContainer, { marginTop: scaleY(20) }]}>
            <View style={styles.supplementalContent}>
              <Text style={styles.supplementalText}>Didn't receive a code?</Text>
              
              {/* Resend Button with Timer */}
              <TouchableOpacity 
                onPress={handleResend} 
                activeOpacity={0.7}
                disabled={!canResend}
              >
                <Text style={[
                  styles.resendText,
                  !canResend && styles.resendTextDisabled // Style changes when disabled
                ]}>
                  {canResend ? 'Resend' : `Resend in ${timeLeft}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: scaleY(120),
    paddingBottom: scaleY(50),
  },
  backButton: {
    position: 'absolute',
    width: scaleX(44),
    height: scaleY(44),
    zIndex: 10,
  },
  backCircle: {
    width: scaleX(44),
    height: scaleY(44),
    borderRadius: scaleY(22),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: scaleX(10),
    paddingVertical: scaleY(6),
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleY(56),
  },
  headerText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: scaleY(32),
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.20)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subheaderContainer: {
    width: '100%',
    paddingHorizontal: scaleX(102),
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleY(47),
    gap: scaleY(4),
  },
  subheaderText: {
    color: '#D3DEE8',
    textAlign: 'center',
    fontSize: scaleY(16),
    fontWeight: '500',
  },
  emailText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: scaleY(16),
    fontWeight: '600',
    width: '200%',
  },
  otpContainer: {
    width: '100%',
    height: scaleY(100),
    paddingHorizontal: scaleX(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleX(12),
    paddingHorizontal: scaleX(17),
  },
  otpBox: {
    width: scaleX(52),
    height: scaleY(64),
    borderRadius: scaleY(4),
    borderWidth: scaleX(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxEmpty: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
  },
  otpBoxFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
  },
  otpBoxActive: {
    backgroundColor: 'rgba(118, 75, 162, 0.20)',
    borderColor: '#764BA2',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: scaleY(24),
    fontWeight: '700',
    color: '#1E293B',
    padding: 0,
  },
  messageText: {
    color: '#FF4136',
    textAlign: 'center',
    fontSize: scaleY(16),
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: scaleX(59),
    height: scaleY(64),
  },
  supplementalContainer: {
    width: '100%',
    paddingHorizontal: scaleX(95),
    paddingVertical: scaleY(11),
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleY(44),
  },
  supplementalContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleX(12),
  },
  supplementalText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: scaleY(16),
    fontWeight: '500',
  },
  resendText: {
    textAlign: 'center',
    fontSize: scaleY(15),
    fontWeight: '800',
    color: '#667EEA',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
});