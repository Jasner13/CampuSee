import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../../constants/colors';
import PrimaryButton from '../../components/buttons/PrimaryButton';

export default function WelcomeScreen() {
    const handleGetStarted = () => {
        console.log('Get Started pressed');
        // TODO: Navigate to Sign Up screen
    };

    const handleLogin = () => {
        console.log('Log In pressed');
        // TODO: Navigate to Login screen
    };

    return (
        <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Logo Area */}
                <View style={styles.logoArea}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>
                            Campu<Text style={styles.logoAccent}>See</Text>
                        </Text>
                    </View>
                    <Text style={styles.tagline}>Your campus community, connected</Text>
                    <Text style={styles.emoji}>🎓</Text>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    <Text style={styles.welcomeText}>Welcome</Text>

                    <PrimaryButton
                        title="Get Started"
                        onPress={handleGetStarted}
                    />

                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={handleLogin}>
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 30,
        paddingVertical: 40,
        justifyContent: 'space-between',
    },
    logoArea: {
        marginTop: 80,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 15,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: COLORS.textLight,
        letterSpacing: -1,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 12,
    },
    logoAccent: {
        color: COLORS.accent,
    },
    tagline: {
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
    },
    emoji: {
        fontSize: 80,
        marginTop: 40,
    },
    bottomSection: {
        backgroundColor: COLORS.backgroundLight,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 30,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 25,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    loginLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});