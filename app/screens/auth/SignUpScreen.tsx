import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { Svg, Path, G, Circle, Defs, ClipPath, Rect } from 'react-native-svg';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateAccount = () => {
    navigation.navigate('CodeVerification', { email });
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
        <View style={styles.statusBar}>
          <Text style={styles.time}>06:07</Text>
          <View style={styles.statusIcons}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M0 4.5525L2 6.5525C6.97 1.5825 15.03 1.5825 20 6.5525L22 4.5525C15.93 -1.5175 6.08 -1.5175 0 4.5525ZM8 12.5525L11 15.5525L14 12.5525C12.35 10.8925 9.66 10.8925 8 12.5525ZM4 8.5525L6 10.5525C8.76 7.7925 13.24 7.7925 16 10.5525L18 8.5525C14.14 4.6925 7.87 4.6925 4 8.5525Z"
                fill="white"
                transform="translate(1, 4) scale(0.92)"
              />
            </Svg>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <G clipPath="url(#clip0)">
                <Path d="M2 22H22V2L2 22Z" fill="white" />
              </G>
              <Defs>
                <ClipPath id="clip0">
                  <Rect width={24} height={24} fill="white" />
                </ClipPath>
              </Defs>
            </Svg>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <G clipPath="url(#clip1)">
                <Path d="M15.67 4H14V2H10V4H8.33C7.6 4 7 4.6 7 5.33V20.66C7 21.4 7.6 22 8.33 22H15.66C16.4 22 17 21.4 17 20.67V5.33C17 4.6 16.4 4 15.67 4Z" fill="white" />
              </G>
              <Defs>
                <ClipPath id="clip1">
                  <Rect width={24} height={24} fill="white" />
                </ClipPath>
              </Defs>
            </Svg>
          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
          <View style={styles.backCircle}>
            <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <Path d="M18 24L10 16L18 8" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Verify</Text>
        </View>

        <View style={styles.subheaderContainer}>
          <Text style={styles.subheaderText}>Your Student Status</Text>
        </View>

        <View style={styles.field1Container}>
          <Text style={styles.fieldLabel}>University Email</Text>
          <View style={styles.textFieldContainer}>
            <View style={styles.fieldContent}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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
              />
            </View>
          </View>
        </View>

        <View style={styles.field2Container}>
          <Text style={styles.fieldLabel}>Create Password</Text>
          <View style={styles.textFieldContainer}>
            <View style={styles.fieldContent}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
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
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.8}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.supplementalContainer}>
          <Text style={styles.supplementalText}>
            We'll send a verification link to your email to confirm your student status
          </Text>
        </View>

        <View style={styles.navBar}>
          <View style={styles.navBarContent}>
            <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
              <Path fillRule="evenodd" clipRule="evenodd" d="M26.4842 17.1461C27.1507 16.7449 28 17.2249 28 18.0028V29.9973C28 30.7752 27.1507 31.2553 26.4842 30.854L16.5222 24.8568C15.8765 24.4681 15.8765 23.532 16.5222 23.1433L26.4842 17.1461Z" fill="#64748B" />
            </Svg>
            <View style={styles.navBarSpacer} />
            <View style={styles.navBarHome} />
            <View style={styles.navBarSpacer} />
            <View style={styles.navBarSquare} />
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
    borderRadius: 20,
  },
  statusBar: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  time: {
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  statusIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  backButton: {
    position: 'absolute',
    left: 32,
    top: 64,
    width: 44,
    height: 44,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    marginTop: 68,
  },
  headerText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.20)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subheaderContainer: {
    width: '100%',
    paddingHorizontal: 100,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 33,
  },
  subheaderText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  field1Container: {
    width: '100%',
    paddingHorizontal: 45,
    marginTop: 64,
    height: 92,
  },
  field2Container: {
    width: '100%',
    paddingHorizontal: 45,
    marginTop: 32,
    height: 92,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  textFieldContainer: {
    width: '100%',
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D3DEE8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  fieldContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: '#64748B',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 0,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 64,
    height: 64,
  },
  buttonGradient: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    paddingVertical: 19,
    paddingHorizontal: 74,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  supplementalContainer: {
    width: '100%',
    paddingHorizontal: 49,
    marginTop: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplementalText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBarContent: {
    width: 234,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBarSpacer: {
    width: 48,
    height: 48,
  },
  navBarHome: {
    width: 16,
    height: 16,
    backgroundColor: '#64748B',
  },
  navBarSquare: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#64748B',
  },
});
