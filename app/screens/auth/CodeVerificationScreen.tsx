import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../../constants/color';
import { Svg, Path, G, Circle, Defs, ClipPath, Rect } from 'react-native-svg';

export default function CodeVerificationScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  const handleVerifyAccount = () => {
    console.log('Verify Account pressed with code:', code.join(''));
  };

  const handleResend = () => {
    console.log('Resend code pressed');
  };

  const handleBack = () => {
    console.log('Back pressed');
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
          <Text style={styles.headerText}>Enter Verification Code</Text>
        </View>

        <View style={styles.subheaderContainer}>
          <Text style={styles.subheaderText}>We sent a 6-digit code to</Text>
          <Text style={styles.emailText}>markuu.amatong@cit.edu</Text>
        </View>

        <View style={styles.otpContainer}>
          <View style={styles.otpBoxes}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  code[index] ? styles.otpBoxFilled : styles.otpBoxEmpty,
                  index === 0 && !code[0] ? styles.otpBoxActive : null,
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleVerifyAccount} activeOpacity={0.8}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Verify Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.supplementalContainer}>
          <View style={styles.supplementalContent}>
            <Text style={styles.supplementalText}>Didn't receive a code?</Text>
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resendGradient}
              >
                <Text style={styles.resendText}>Resend</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 27,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    marginTop: 108,
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
    paddingHorizontal: 102,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: 47,
  },
  subheaderText: {
    color: '#D3DEE8',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  emailText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  otpContainer: {
    width: '100%',
    height: 100,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  },
  otpBoxes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 17,
  },
  otpBox: {
    width: 52,
    height: 64,
    borderRadius: 4,
    borderWidth: 2,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 59,
    marginTop: 32,
    height: 64,
  },
  buttonGradient: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    paddingVertical: 19,
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
    paddingHorizontal: 95,
    paddingVertical: 11,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    marginTop: 20,
  },
  supplementalContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  supplementalText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  resendGradient: {
    borderRadius: 4,
  },
  resendText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#667EEA',
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
