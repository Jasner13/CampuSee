import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Removed: import { GRADIENTS } from '../constants/colors'; 

interface PrimaryButtonProps {
    // We remove 'title: string' and replace it with 'children'
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    // Allows any React element (Text, Image, etc.) to be placed inside the button
    children: React.ReactNode; 
}

// Hardcoded the gradient colors directly here
const DEFAULT_GRADIENT_COLORS = ['#4F46E5', '#6366F1', '#8B5CF6'] as const;

export default function PrimaryButton({
    onPress,
    disabled = false,
    style,
    children // The UI content passed from the parent
}: PrimaryButtonProps) {
    // The functionality (onPress, disabled) is still applied here, 
    // but the actual function definition resides in the parent component.
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            // Allow external styles (like width) to be applied
            style={[styles.container, style]} 
            activeOpacity={0.8}
        >
            <LinearGradient
                // Using the hardcoded constant instead of the imported one
                colors={DEFAULT_GRADIENT_COLORS} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                // The style now only controls the gradient background and opacity
                style={[styles.gradient, disabled && styles.disabled]}
            >
                {/* Renders the content (Text, etc.) passed by the parent */}
                {children} 
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        // Styling the button container/shadow
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 15,
    },
    gradient: {
        flex: 1,
        // Ensure content is centered inside the gradient
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    // The 'text' style is removed, forcing the parent to define the Text style
});