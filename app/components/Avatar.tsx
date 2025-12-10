import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native'; // Added Image
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, COLORS } from '../constants/colors';

interface AvatarProps {
  initials: string;
  avatarUrl?: string | null; // Add this prop
  size?: 'default' | 'small' | 'large'; // Added 'large' for flexibility
}

export const Avatar: React.FC<AvatarProps> = ({ initials, avatarUrl, size = 'default' }) => {
  // Determine dimensions based on size prop
  let dimension = 54; // default
  let fontSize = 20;

  if (size === 'small') {
    dimension = 40;
    fontSize = 16;
  } else if (size === 'large') {
    dimension = 96;
    fontSize = 32;
  }
  
  const containerStyle = { width: dimension, height: dimension, borderRadius: dimension / 2 };

  
  if (avatarUrl) {
    return (
      <Image 
        source={{ uri: avatarUrl }} 
        style={[styles.image, containerStyle]} 
      />
    );
  }

 
  return (
    <View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.233, y: 1.155 }}
        style={[styles.gradient, containerStyle]}
      >
        <Text style={[styles.initials, { fontSize }]}>
          {initials}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#E5E7EB',
    resizeMode: 'cover',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: COLORS.textLight,
    fontWeight: '800',
    textAlign: 'center',
  },
});