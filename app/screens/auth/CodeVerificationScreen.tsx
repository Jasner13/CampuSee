import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  Dimensions, // Added for dynamic sizing
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { Svg, Path } from 'react-native-svg'; // Only Svg and Path are needed

// --- Dynamic Layout Setup ---
const { height, width } = Dimensions.get('window');
const DESIGN_HEIGHT = 896;
const DESIGN_WIDTH = 414;

// Helper function for scaling vertical values
const scaleY = (value: number) => (height / DESIGN_HEIGHT) * value;
// Helper function for scaling horizontal values
const scaleX = (value: number) => (width / DESIGN_WIDTH) * value;

type CodeVerificationScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'CodeVerification'>;
type CodeVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'CodeVerification'>;

// ===========================================
// PrimaryButton Component Definition (Simulating an external import)
// ===========================================

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode; 
}

// Hardcoded the gradient colors exactly as provided in the previous component
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
  // Style for the button's text content
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: scaleY(20),
    fontWeight: '800',
  },
});

// ===========================================
// CodeVerificationScreen
// ===========================================

export default function CodeVerificationScreen() {
  const navigation = useNavigation<CodeVerificationScreenNavigationProp>();
  const route = useRoute<CodeVerificationScreenRouteProp>();

  const { verifyOtp } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  // Added state for showing UI error messages (replaces alert())
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); 
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // LOGIC: Existing change handler
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // LOGIC: Existing key press handler
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // LOGIC: Updated to use setMessage instead of alert()
  const handleVerifyAccount = async () => {
    setMessage('');
    const fullCode = code.join('');

    if (fullCode.length === 6) {
      setLoading(true);
      const { error } = await verifyOtp(route.params.email, fullCode);
      setLoading(false);
      
      if (error) {
        // Replaced alert with UI state update
        setMessage(error.message); 
      } else {
        // AuthContext will automatically switch the navigator to Home
        console.log('Verification successful');
      }
    } else {
      // Replaced alert with UI state update
      setMessage('Please enter the full 6-digit code'); 
    }
  };

  // LOGIC: Existing resend handler
  const handleResend = () => {
    console.log('Resend code to:', route.params.email);
    // Optional: Add resend logic here using supabase.auth.resend({ email })
  };

  // LOGIC: Existing back handler
  const handleBack = () => {
    navigation.goBack();
  };

  // --- UI START ---
  return (
    <View style={styles.container}>
      {/* Set status bar to translucent and light content for best look */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667EEA', '#FFFFFF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.background}
      >
        {/* Back Button (Moved up slightly because status bar is translucent) */}
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
        
        {/* Main Content Wrapper - Enables Dynamic Centralization */}
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
                    // Active state check for current focused/empty box
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

          {/* Using the PrimaryButton component */}
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
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendText}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
        {/* The bottom nav bar (styles.navBar) has been removed */}
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
  
  // New wrapper to dynamically center content
  contentWrapper: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    // Adding top padding to avoid content clash with back button
    paddingTop: scaleY(120), 
    paddingBottom: scaleY(50), 
  },

  // Removed statusBar styles
  
  backButton: {
    position: 'absolute',
    // Apply scaled positioning
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
    // Removed fixed marginTop: 108 for dynamic centering
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
    // Added gap for vertical spacing in subheader
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
    // Replaced fixed marginTop: 64 with dynamic version
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
    padding: 0, // Ensure no extra padding from RN default
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
    // Replaced fixed marginTop: 32 with dynamic version
    height: scaleY(64),
  },
  // Removed buttonGradient and buttonText styles as they are now in primaryButtonStyles
  
  supplementalContainer: {
    width: '100%',
    paddingHorizontal: scaleX(95),
    paddingVertical: scaleY(11),
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleY(44),
    // Replaced fixed marginTop: 20 with dynamic version
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
  // Removed all navBar styles
});