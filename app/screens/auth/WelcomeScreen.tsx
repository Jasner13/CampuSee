import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { COLORS, GRADIENTS } from '../../constants/colors';

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
            style={styles.container}
        >
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
                        source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/ae1c0b46742dc488fafd18d4fa97ed22897095d1?width=280' }}
                        style={styles.logoIdea}
                    />
                    <Image
                        source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/6eed37d9505d1c7df81ce8b4adb501f4e991fd3b?width=284' }}
                        style={styles.appLogo}
                    />
                </View>
            </View>

            <View style={styles.actionCardContainer}>
                <View style={styles.contentContainer}>
                        <Text style={styles.welcomeText}>Welcome</Text>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={handleGetStarted}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={GRADIENTS.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Get Started</Text>
                            </LinearGradient>
                        </TouchableOpacity>

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
        borderRadius: 20,
        position: 'relative',
    },
    titleContainer: {
        width: '100%',
        height: 221,
        paddingHorizontal: 70,
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
    },
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
    taglineContainer: {
        width: '100%',
        height: 97,
        paddingHorizontal: 30,
        paddingVertical: 36,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 221,
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
    logoContainer: {
        width: '100%',
        height: 140,
        paddingHorizontal: 136,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 319,
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
    actionCardContainer: {
        width: 332,
        height: 381,
        paddingHorizontal: 19,
        paddingTop: 55,
        paddingBottom: 132,
        borderRadius: 40,
        backgroundColor: COLORS.background,
        position: 'absolute',
        left: 25,
        top: 510,
        alignItems: 'center',
    },
    contentContainer: {
        width: 294,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    welcomeTextGradient: {
        borderRadius: 4,
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
    buttonContainer: {
        width: 294,
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        paddingVertical: 19,
        paddingHorizontal: 91,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.textLight,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '800',
        lineHeight: 27,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loginPrompt: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 16,
    },
    loginLinkGradient: {
        borderRadius: 4,
    },
    loginLink: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '800',
        lineHeight: 15,
        color: COLORS.primary,
    },
});
