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
import { COLORS } from '../../constants/colors';
import { Svg, Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';

// --- Dynamic Layout Setup ---
const { height, width } = Dimensions.get('window');
const DESIGN_HEIGHT = 896;
const DESIGN_WIDTH = 414;

// Helper function for scaling vertical values
const scaleY = (value: number) => (height / DESIGN_HEIGHT) * value;
// Helper function for scaling horizontal values
const scaleX = (value: number) => (width / DESIGN_WIDTH) * value;

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

// ===========================================
// PrimaryButton Component Definition (Simulating an external import)
// ===========================================

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

// Hardcoded the gradient colors exactly as provided
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
// SignUpScreen
// ===========================================

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateAccount = async () => {
    setMessage('');

    if (!email || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signup(email, password);
    setLoading(false);

    if (error) {
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
            <Text style={styles.headerText}>Verify</Text>
          </View>

          <View style={styles.subheaderContainer}>
            <Text style={styles.subheaderText}>Your Student Status</Text>
          </View>

          <View style={[styles.fieldContainer, { marginTop: scaleY(64) }]}>
            <Text style={styles.fieldLabel}>University Email</Text>
            <View style={styles.textFieldContainer}>
              <View style={styles.fieldContent}>
                <Svg width={scaleX(24)} height={scaleY(24)} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  inputAccessoryViewID="none"
                />
              </View>
            </View>
          </View>

          <View style={[styles.fieldContainer, { marginTop: scaleY(32) }]}>
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
                  secureTextEntry
                  inputAccessoryViewID="none"
                />
              </View>
            </View>
          </View>

          {message ? (
            <Text style={[styles.messageText, {
              marginTop: scaleY(20),
              paddingHorizontal: scaleX(45)
            }]}>{message}</Text>
          ) : null}


          {/* Using the locally defined PrimaryButton component */}
          <View style={[styles.buttonContainer, {
            marginTop: message ? scaleY(24) : scaleY(64)
          }]}>
            <PrimaryButton
              onPress={handleCreateAccount}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {/* Content passed as children, styled with local PrimaryButton style constant */}
              <Text style={primaryButtonStyles.buttonText}>
                {loading ? 'Creating...' : 'Create Account'}
              </Text>
            </PrimaryButton>
          </View>

          <View style={[styles.supplementalContainer, { marginTop: scaleY(20) }]}>
            <Text style={styles.supplementalText}>
              We'll send a verification link to your email to confirm your student status
            </Text>
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
    paddingTop: scaleY(50),
    paddingBottom: scaleY(50),
  },

  backButton: {
    position: 'absolute',
    left: scaleX(32),
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
    paddingHorizontal: scaleX(100),
    paddingVertical: scaleY(5),
    justifyContent: 'center',
    alignItems: 'center',
    height: scaleY(33),
  },
  subheaderText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: scaleY(18),
    fontWeight: '600',
  },

  fieldContainer: {
    width: '100%',
    paddingHorizontal: scaleX(45),
    height: scaleY(92),
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: scaleY(15),
    fontWeight: '800',
    marginBottom: scaleY(8),
  },
  textFieldContainer: {
    width: '100%',
    height: scaleY(64),
    borderRadius: scaleY(12),
    borderWidth: scaleX(2),
    borderColor: '#D3DEE8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  fieldContent: {
    flexDirection: 'row',
    paddingHorizontal: scaleX(16),
    alignItems: 'center',
    gap: scaleX(12),
  },
  textInput: {
    flex: 1,
    color: '#64748B',
    fontFamily: 'Nunito Sans',
    fontSize: scaleY(18),
    fontWeight: '600',
    paddingVertical: 0,
    height: '100%',
  },

  messageText: {
    color: '#FF4136',
    textAlign: 'center',
    fontSize: scaleY(16),
    fontWeight: '700',
  },

  buttonContainer: {
    width: '100%',
    paddingHorizontal: scaleX(40),
    height: scaleY(64),
  },

  supplementalContainer: {
    width: '100%',
    paddingHorizontal: scaleX(49),
    height: scaleY(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplementalText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: scaleY(16),
    fontWeight: '500',
    lineHeight: scaleY(22),
  },
});