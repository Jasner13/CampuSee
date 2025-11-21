import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

interface ChipProps {
  label: string;
}

export const Chip: React.FC<ChipProps> = ({ label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#D3DEE8',
    alignSelf: 'flex-start',
  },
  label: {
    color: COLORS.textTertiary,
    fontSize: FONTS.sizes.base,
    fontWeight: '800',
    textAlign: 'center',
  },
});
