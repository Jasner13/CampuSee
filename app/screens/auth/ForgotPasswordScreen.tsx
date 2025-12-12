import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');
const DESIGN_HEIGHT = 896;
const DESIGN_WIDTH = 414;
const scaleY = (val: number) => (height / DESIGN_HEIGHT) * val;
const scaleX = (val: number) => (width / DESIGN_WIDTH) * val;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) => {
    // Strict format: firstname.lastname@cit.edu
    const citRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@cit\.edu$/;
    return citRegex.test(email);
  };

  const handleSendReset = async () => {
    setMessage('');

    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please use a valid CIT email (firstname.lastname@cit.edu).');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      Alert.alert(
        'Check your email', 
        'We sent you a link to reset your password.',
        [{ text: 'Back to Login', onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667EEA', '#FFFFFF']}
        locations={[0, 1]}
        style={styles.gradient}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: scaleY(64), left: scaleX(32) }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backCircle}>
            <Svg width={scaleX(32)} height={scaleY(32)} viewBox="0 0 32 32" fill="none">
              <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
        </TouchableOpacity>

        <View style={styles.contentWrapper}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Forgot Password?</Text>
          </View>

          <View style={styles.subheaderContainer}>
            <Text style={styles.subheaderText}>
              Enter your university email and we'll send you a recovery link.
            </Text>
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

          <View style={[styles.fieldContainer, { marginTop: message ? scaleY(10) : scaleY(32) }]}>
            <Text style={styles.fieldLabel}>University Email</Text>
            <View style={styles.textField}>
              <View style={styles.fieldContent}>
                {/* Mail Icon SVG */}
                <Svg width={scaleX(24)} height={scaleY(24)} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

          <View style={styles.buttonContainer}>
            <PrimaryButton
              onPress={handleSendReset}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Link'}</Text>
            </PrimaryButton>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  backButton: { position: 'absolute', width: scaleX(44), height: scaleY(44), zIndex: 10 },
  backCircle: { width: scaleX(44), height: scaleY(44), borderRadius: scaleY(22), backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  contentWrapper: { flex: 1, alignItems: 'center', width: '100%', paddingTop: scaleY(140) },
  headerContainer: { width: '100%', alignItems: 'center', marginBottom: scaleY(12) },
  headerText: { color: '#FFFFFF', fontSize: scaleY(32), fontWeight: '900', fontFamily: 'Nunito Sans' },
  subheaderContainer: { width: '100%', paddingHorizontal: scaleX(60), alignItems: 'center', marginBottom: scaleY(0) },
  subheaderText: { color: '#FFFFFF', textAlign: 'center', fontSize: scaleY(16), fontWeight: '500', fontFamily: 'Nunito Sans' },
  errorContainerWrapper: { width: '100%', alignItems: 'center', marginTop: scaleY(20), paddingHorizontal: scaleX(45), minHeight: scaleY(30) },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 65, 54, 0.1)', paddingVertical: scaleY(8), paddingHorizontal: scaleX(16), borderRadius: scaleY(8), borderWidth: 1, borderColor: 'rgba(255, 65, 54, 0.3)', gap: scaleX(8) },
  messageText: { color: '#FF4136', textAlign: 'left', fontSize: scaleY(14), fontWeight: '700', flex: 1 },
  fieldContainer: { width: '100%', paddingHorizontal: scaleX(45), marginBottom: scaleY(32) },
  fieldLabel: { color: '#FFFFFF', fontSize: scaleY(15), fontWeight: '800', marginBottom: scaleY(8), fontFamily: 'Nunito Sans' },
  textField: { width: '100%', height: scaleY(64), borderRadius: scaleY(12), borderWidth: 2, borderColor: '#D3DEE8', backgroundColor: '#FFFFFF', justifyContent: 'center' },
  fieldContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scaleX(16), gap: scaleX(12) },
  textInput: { flex: 1, fontSize: scaleY(18), fontWeight: '600', color: '#64748B', height: '100%', fontFamily: 'Nunito Sans' },
  buttonContainer: { width: '100%', paddingHorizontal: scaleX(45) },
  buttonText: { color: '#FFFFFF', textAlign: 'center', fontSize: scaleY(20), fontWeight: '800', fontFamily: 'Nunito Sans' },
});