import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryStyle, getCategoryLabel } from '../constants/categories';

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const stylesParams = getCategoryStyle(category);
  const label = getCategoryLabel(category);

  return (
    <View style={[styles.badge, { backgroundColor: stylesParams.bg }]}>
      <Text style={[styles.text, { color: stylesParams.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start', // Ensures it wraps closely around text
  },
  text: {
    fontWeight: '700',
    fontSize: 11, // Matching PostCard font size
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});