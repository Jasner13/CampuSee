import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  StyleProp,
  ViewStyle,
  Platform, // Import Platform to handle OS specifics
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import Svg, { Path } from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons'; // Ensure this package is installed
import { COLORS } from '../../constants/colors';

// --- Dynamic Layout Setup ---
const { height, width } = Dimensions.get('window');
const DESIGN_HEIGHT = 896;
const DESIGN_WIDTH = 414;

const scaleY = (value: number) => (height / DESIGN_HEIGHT) * value;
const scaleX = (value: number) => (width / DESIGN_WIDTH) * value;

// ===========================================
// PrimaryButton Component
// ===========================================

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
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(20),
        fontWeight: '800',
    },
});

// ===========================================
// LoginScreen Component
// ===========================================

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(''); 
    
    // State to toggle password visibility
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLogin = async () => {
        setMessage(''); 
        
        if (!email || !password) {
            setMessage("Please enter your email and password."); 
            return;
        }

        setLoading(true);
        const { error } = await login(email, password);
        setLoading(false);

        if (error) {
            setMessage(error.message); 
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

                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <View style={styles.contentWrapper}>

                        {/* 1. Header */}
                        <View style={[styles.headerContainer, { marginTop: scaleY(108) }]}>
                            <Text style={styles.headerText}>Welcome Back!</Text>
                        </View>

                        <View style={styles.subheaderContainer}>
                            <Text style={styles.subheaderText}>Log in to your account</Text>
                        </View>

                        {/* 2. Email Field */}
                        <View style={styles.field1Container}>
                            <Text style={styles.fieldLabel}>University Email</Text>
                            <View style={styles.textField}>
                                <View style={styles.fieldContent}>
                                    <Svg width={scaleX(24)} height={scaleY(24)} viewBox="0 0 24 24" fill="none">
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
                                        placeholder="lastname.firstname@cit.edu"
                                        placeholderTextColor="#64748B"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="email" 
                                    />
                                </View>
                            </View>
                        </View>

                        {/* 3. Password Field */}
                        <View style={styles.field2Container}>
                            <Text style={styles.fieldLabel}>Password</Text>
                            <View style={styles.textField}>
                                <View style={styles.fieldContent}>
                                    <Svg width={scaleX(24)} height={scaleY(24)} viewBox="0 0 24 24" fill="none">
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
                                        secureTextEntry={!isPasswordVisible}
                                        // CRITICAL: Disable all smart features to reduce lag/flicker
                                        autoCorrect={false}
                                        spellCheck={false}
                                        textContentType="none" // iOS: Disable keychain lookups while typing
                                        autoCapitalize="none"
                                        keyboardType="default"
                                        // Android: Disable autocomplete bar and autofill to prevent UI lag
                                        autoComplete="off" 
                                        importantForAutofill="no" 
                                    />
                                    {/* Updated Icon: Uses Ionicons "eye" vs "eye-off" */}
                                    <TouchableOpacity 
                                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Easier to tap
                                    >
                                        <Ionicons 
                                            name={isPasswordVisible ? "eye-off" : "eye"} 
                                            size={22} 
                                            color={COLORS.textSecondary} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        
                        {/* 4. Forgot Password */}
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
                        
                        {/* 5. Error Message */}
                        {message ? (
                            <Text style={[styles.messageText, { 
                                marginTop: scaleY(20), 
                                paddingHorizontal: scaleX(45) 
                            }]}>
                                {message}
                            </Text>
                        ) : null}

                        {/* 6. Log In Button */}
                        <View style={[styles.loginButtonContainer, { 
                            marginTop: message ? scaleY(24) : scaleY(60) 
                        }]}>
                            <PrimaryButton
                                onPress={handleLogin}
                                disabled={loading}
                                style={{ width: scaleX(294) }}
                            >
                                <Text style={primaryButtonStyles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
                            </PrimaryButton>
                        </View>

                        {/* 7. Sign Up Link */}
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
    contentWrapper: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        paddingBottom: scaleY(20),
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        width: '100%',
        height: scaleY(56),
        paddingHorizontal: scaleX(88),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaleY(108), 
    },
    headerText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(32),
        fontWeight: '900',
        textShadowColor: 'rgba(0, 0, 0, 0.20)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subheaderContainer: {
        width: '100%',
        height: scaleY(33),
        paddingHorizontal: scaleX(116),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaleY(0),
    },
    subheaderText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(18),
        fontWeight: '600',
        width: '200%',
    },
    field1Container: {
        width: '100%',
        height: scaleY(92),
        paddingHorizontal: scaleX(45),
        justifyContent: 'center',
        marginTop: scaleY(64),
    },
    field2Container: {
        width: '100%',
        height: scaleY(92),
        paddingHorizontal: scaleX(45),
        justifyContent: 'center',
        marginTop: scaleY(32),
    },
    fieldLabel: {
        color: '#FFFFFF',
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(15),
        fontWeight: '800',
        marginBottom: scaleY(8),
    },
    textField: {
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
        alignItems: 'center',
        paddingHorizontal: scaleX(16),
        gap: scaleX(12),
    },
    textInput: {
        flex: 1,
        color: '#64748B',
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(18),
        fontWeight: '600',
        paddingVertical: 0,
        height: scaleY(60),
    },
    messageText: {
        color: '#FF4136',
        textAlign: 'center',
        fontSize: scaleY(16),
        fontWeight: '700',
    },
    forgotPasswordContainer: {
        width: '100%',
        height: scaleY(32),
        paddingRight: scaleX(47),
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginTop: scaleY(8),
    },
    gradientTextMask: {
        height: scaleY(25),
    },
    forgotPasswordText: {
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(15),
        fontWeight: '800',
    },
    loginButtonContainer: {
        width: '100%',
        height: scaleY(64),
        paddingHorizontal: scaleX(59),
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpContainer: {
        width: '100%',
        height: scaleY(32),
        paddingHorizontal: scaleX(88),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaleY(20),
    },
    signUpFrame: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleX(12),
    },
    signUpPrompt: {
        color: '#64748B',
        textAlign: 'center',
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(16),
        fontWeight: '500',
    },
    signUpText: {
        textAlign: 'center',
        fontFamily: 'Nunito Sans',
        fontSize: scaleY(15),
        fontWeight: '800',
    },
});