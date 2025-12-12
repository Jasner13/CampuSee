import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, COLORS } from '../constants/colors';

interface AvatarProps {
  initials: string;
  avatarUrl?: string | null;
  size?: 'default' | 'small' | 'large';
  isOnline?: boolean; // <--- ADDED
}

export const Avatar: React.FC<AvatarProps> = ({ initials, avatarUrl, size = 'default', isOnline = false }) => {
  // Determine dimensions based on size prop
  let dimension = 54; // default
  let fontSize = 20;
  let badgeSize = 14;
  let badgeBorder = 2;

  if (size === 'small') {
    dimension = 40;
    fontSize = 16;
    badgeSize = 10;
    badgeBorder = 1.5;
  } else if (size === 'large') {
    dimension = 96;
    fontSize = 32;
    badgeSize = 20;
    badgeBorder = 3;
  }
  
  const containerStyle = { width: dimension, height: dimension, borderRadius: dimension / 2 };

  const renderContent = () => {
    if (avatarUrl) {
      return (
        <Image 
          source={{ uri: avatarUrl }} 
          style={[styles.image, containerStyle]} 
        />
      );
    }
    
    return (
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
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderContent()}
      {isOnline && (
        <View style={[
          styles.onlineBadge, 
          { 
            width: badgeSize, 
            height: badgeSize, 
            borderRadius: badgeSize / 2, 
            borderWidth: badgeBorder 
          }
        ]} />
      )}
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
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.success,
    borderColor: '#FFFFFF', 
    zIndex: 10,
  }
});