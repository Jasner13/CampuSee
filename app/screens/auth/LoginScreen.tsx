import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import Svg, { Path } from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      alert(error.message);
    }
    // Success logic is handled by AuthContext
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667EEA', '#FFFFFF']}
        locations={[0, 1]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <View style={styles.backCircle}>
                <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <Path
                    d="M18 24L10 16L18 8"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Welcome Back!</Text>
          </View>

          <View style={styles.subheaderContainer}>
            <Text style={styles.subheaderText}>Log in to your account</Text>
          </View>

          <View style={styles.field1Container}>
            <Text style={styles.fieldLabel}>University Email</Text>
            <View style={styles.textField}>
              <View style={styles.fieldContent}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.textField}>
              <View style={styles.fieldContent}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity activeOpacity={0.7}>
              <MaskedView
                maskElement={<Text style={styles.forgotPasswordText}>Forgot Password?</Text>}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientTextMask}
                >
                  <Text style={[styles.forgotPasswordText, { opacity: 0 }]}>Forgot Password?</Text>
                </LinearGradient>
              </MaskedView>
            </TouchableOpacity>
          </View>

          <View style={styles.loginButtonContainer}>
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
              >
                <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.signUpContainer}>
            <View style={styles.signUpFrame}>
              <Text style={styles.signUpPrompt}>Don't have an account?</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('SignUp')}>
                <MaskedView
                  maskElement={<Text style={styles.signUpText}>Sign Up</Text>}
                >
                  <LinearGradient
                    colors={['#667EEA', '#764BA2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientTextMask}
                  >
                    <Text style={[styles.signUpText, { opacity: 0 }]}>Sign Up</Text>
                  </LinearGradient>
                </MaskedView>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topContainer: {
    width: '100%',
    height: 44,
    paddingLeft: 32,
    paddingRight: 336,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    width: '100%',
    height: 56,
    paddingHorizontal: 88,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 44,
  },
  headerText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Nunito Sans',
    fontSize: 32,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.20)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subheaderContainer: {
    width: '100%',
    height: 33,
    paddingHorizontal: 116,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  subheaderText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Nunito Sans',
    fontSize: 18,
    fontWeight: '600',
  },
  field1Container: {
    width: '100%',
    height: 92,
    paddingHorizontal: 45,
    justifyContent: 'center',
    marginTop: 64,
  },
  field2Container: {
    width: '100%',
    height: 92,
    paddingHorizontal: 45,
    justifyContent: 'center',
    marginTop: 32,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontFamily: 'Nunito Sans',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  textField: {
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
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: '#64748B',
    fontFamily: 'Nunito Sans',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 0,
  },
  forgotPasswordContainer: {
    width: '100%',
    height: 32,
    paddingLeft: 237,
    paddingRight: 47,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  gradientTextMask: {
    height: 25,
  },
  forgotPasswordText: {
    fontFamily: 'Nunito Sans',
    fontSize: 15,
    fontWeight: '800',
  },
  loginButtonContainer: {
    width: '100%',
    height: 64,
    paddingHorizontal: 59,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loginButton: {
    width: 294,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Nunito Sans',
    fontSize: 20,
    fontWeight: '800',
  },
  signUpContainer: {
    width: '100%',
    height: 32,
    paddingHorizontal: 88,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signUpPrompt: {
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Nunito Sans',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpText: {
    textAlign: 'center',
    fontFamily: 'Nunito Sans',
    fontSize: 15,
    fontWeight: '800',
  },
});