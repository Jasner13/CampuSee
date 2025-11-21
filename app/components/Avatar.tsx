import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

interface AvatarProps {
  initials: string;
  size?: 'default' | 'small';
}

export const Avatar: React.FC<AvatarProps> = ({ initials, size = 'default' }) => {
  const avatarSize = size === 'default' ? 54 : 40;
  
  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.233, y: 1.155 }}
        style={[styles.gradient, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
      >
        <Text style={[styles.initials, { fontSize: size === 'default' ? 20 : 16 }]}>
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
