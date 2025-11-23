import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { COLORS, GRADIENTS } from '../../constants/colors';

import PrimaryButton from '../../components/buttons/PrimaryButton';
import Logo from '../../../assets/Logo/3D.png';


// 1. Get the current screen height dynamically
const { height } = Dimensions.get('window');
// 2. Define the height the original fixed design was based on (510 + 381 = 891, using 896 as a round base)
const DESIGN_HEIGHT = 896; 

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

    const handleGetStarted = () => {
        navigation.navigate('SignUp');
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.container} // `styles.container` handles horizontal centering
        >
            {/* All container positions and heights are now scaled based on screen height */}
            <View style={styles.titleContainer}>
                <Text style={styles.appName}>
                    <Text style={styles.appNameWhite}>Campu</Text>
                    <Text style={styles.appNameGold}>See</Text>
                </Text>
            </View>

            <View style={styles.taglineContainer}>
                <Text style={styles.appTagline}>Your campus community, connected</Text>
            </View>

            <View style={styles.logoContainer}>
                <View style={styles.logoFrame}>
                    <Image
                        source={Logo}
                        style={styles.logoIdea}
                    />
                    <Image
                        source={Logo}
                        style={styles.appLogo}
                    />
                </View>
            </View>

            <View style={styles.actionCardContainer}>
                <View style={styles.contentContainer}>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <View style={styles.actionsContainer}>
                        
                        <PrimaryButton
                            onPress={handleGetStarted}
                            style={{ width: 294 }} 
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </PrimaryButton>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginPrompt}>Already have an account?</Text>
                            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
                                    <Text style={styles.loginLink}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative', 
        alignItems: 'center', // Handles horizontal centering
    },
    
    // --- Responsive Vertical Positioning ---

    titleContainer: {
        width: '100%',
        // Scaled height
        height: height * (200 / DESIGN_HEIGHT),
        paddingHorizontal: 60,
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        top: height * (0 / DESIGN_HEIGHT), // top: 0
    },
    taglineContainer: {
        width: '100%',
        // Scaled height
        height: height * (100 / DESIGN_HEIGHT),
        paddingHorizontal: 30,
        paddingVertical: height * (10 / DESIGN_HEIGHT),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        // Scaled top: (Original 221)
        top: height * (200 / DESIGN_HEIGHT),
    },
    logoContainer: {
        width: '100%',
        height: 140, // Keeping logo height fixed to maintain aspect ratio
        paddingHorizontal: 135, 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        // Scaled top: (Original 319)
        top: height * (310 / DESIGN_HEIGHT),
    },
    actionCardContainer: {
        width: 332,
        height: 600, // taas para dili ma kita ang border sa bottom
        paddingHorizontal: 19,
        paddingTop: 55,
        paddingBottom: 132,
        borderRadius: 40,
        backgroundColor: COLORS.background,
        position: 'absolute',
        // Scaled top: (Original 510) - This is the critical fix for vertical placement
        top: height * (510 / DESIGN_HEIGHT), 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    
    // --- Unchanged Inner Styles ---

    appName: {
        textAlign: 'center',
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 48,
        textShadowColor: 'rgba(0, 0, 0, 0.20)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 20,
    },
    appNameWhite: {
        color: COLORS.textLight,
        fontWeight: '900',
        fontSize: 48,
    },
    appNameGold: {
        color: COLORS.accent,
        fontWeight: '900',
        fontSize: 48,
    },
    appTagline: {
        color: COLORS.textLight,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 25,
        textShadowColor: 'rgba(0, 0, 0, 0.20)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 20,
    },
    logoFrame: {
        width: 140,
        height: 140,
        borderRadius: 70,
        position: 'relative',
    },
    logoIdea: {
        width: 140,
        height: 140,
        borderRadius: 70,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    appLogo: {
        width: 142,
        height: 142,
        borderRadius: 71,
        position: 'absolute',
        left: -1,
        top: -1,
    },
    contentContainer: {
        width: 294, 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    welcomeText: {
        width: '100%',
        textAlign: 'center',
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 32,
        color: COLORS.primary,
    },
    actionsContainer: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
    },
    buttonText: {
        color: COLORS.textLight,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '800',
        lineHeight: 30,
    },
    loginPrompt: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        // 💡 Fix: Increase lineHeight to be greater than fontSize (16 * 1.2 = 19.2)
        lineHeight: 30, // Try 20, or even 24 for more space
    },
    loginLink: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
        // 💡 Fix: Increase lineHeight to be greater than fontSize (15 * 1.2 = 18)
        lineHeight: 18, // Try 18, or 20
    },

    // --- loginContainer (Keep as is, or remove padding if you added it) ---

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        // If you added paddingVertical here, you can remove it now, 
        // as the fix is in the text elements.
    },
});