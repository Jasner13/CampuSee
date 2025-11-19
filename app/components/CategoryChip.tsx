import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { GRADIENTS, COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { CategoryType } from '../constants/categories';

interface CategoryChipProps {
  type: CategoryType;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryIcon: React.FC<{ type: CategoryType }> = ({ type }) => {
  if (type === 'all') return null;

  if (type === 'study') {
    return (
      <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <Path
          d="M1.5 2.25H6C6.79565 2.25 7.55871 2.56607 8.12132 3.12868C8.68393 3.69129 9 4.45435 9 5.25V15.75C9 15.1533 8.76295 14.581 8.34099 14.159C7.91903 13.7371 7.34674 13.5 6.75 13.5H1.5V2.25Z"
          stroke="url(#paint0_linear_study)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16.5 2.25H12C11.2044 2.25 10.4413 2.56607 9.87868 3.12868C9.31607 3.69129 9 4.45435 9 5.25V15.75C9 15.1533 9.23705 14.581 9.65901 14.159C10.081 13.7371 10.6533 13.5 11.25 13.5H16.5V2.25Z"
          stroke="url(#paint1_linear_study)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Defs>
          <SvgLinearGradient id="paint0_linear_study" x1="5.25" y1="2.25" x2="5.25" y2="15.75">
            <Stop stopColor="#10B981" />
            <Stop offset="1" stopColor="#009D4C" />
          </SvgLinearGradient>
          <SvgLinearGradient id="paint1_linear_study" x1="12.75" y1="2.25" x2="12.75" y2="15.75">
            <Stop stopColor="#10B981" />
            <Stop offset="1" stopColor="#009D4C" />
          </SvgLinearGradient>
        </Defs>
      </Svg>
    );
  }

  if (type === 'items') {
    return (
      <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <Path
          d="M12.375 7.04997L5.625 3.15747"
          stroke="url(#paint0_linear_items)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15.75 11.9999V5.99993C15.7497 5.73688 15.6803 5.47853 15.5487 5.2508C15.417 5.02306 15.2278 4.83395 15 4.70243L9.75 1.70243C9.52197 1.57077 9.2633 1.50146 9 1.50146C8.7367 1.50146 8.47803 1.57077 8.25 1.70243L3 4.70243C2.7722 4.83395 2.58299 5.02306 2.45135 5.2508C2.31971 5.47853 2.25027 5.73688 2.25 5.99993V11.9999C2.25027 12.263 2.31971 12.5213 2.45135 12.7491C2.58299 12.9768 2.7722 13.1659 3 13.2974L8.25 16.2974C8.47803 16.4291 8.7367 16.4984 9 16.4984C9.2633 16.4984 9.52197 16.4291 9.75 16.2974L15 13.2974C15.2278 13.1659 15.417 12.9768 15.5487 12.7491C15.6803 12.5213 15.7497 12.263 15.75 11.9999Z"
          stroke="url(#paint1_linear_items)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.45215 5.21997L8.99965 9.00747L15.5471 5.21997"
          stroke="url(#paint2_linear_items)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 16.56V9"
          stroke="url(#paint3_linear_items)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Defs>
          <SvgLinearGradient id="paint0_linear_items" x1="9" y1="3.15747" x2="9" y2="7.04997">
            <Stop stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#F59E0B" />
          </SvgLinearGradient>
          <SvgLinearGradient id="paint1_linear_items" x1="9" y1="1.50146" x2="9" y2="16.4984">
            <Stop stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#F59E0B" />
          </SvgLinearGradient>
          <SvgLinearGradient id="paint2_linear_items" x1="8.99965" y1="5.21997" x2="8.99965" y2="9.00747">
            <Stop stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#F59E0B" />
          </SvgLinearGradient>
          <SvgLinearGradient id="paint3_linear_items" x1="9.5" y1="9" x2="9.5" y2="16.56">
            <Stop stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#F59E0B" />
          </SvgLinearGradient>
        </Defs>
      </Svg>
    );
  }

  if (type === 'events') {
    return (
      <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <Path
          d="M14.25 3H3.75C2.92157 3 2.25 3.67157 2.25 4.5V15C2.25 15.8284 2.92157 16.5 3.75 16.5H14.25C15.0784 16.5 15.75 15.8284 15.75 15V4.5C15.75 3.67157 15.0784 3 14.25 3Z"
          stroke="url(#paint0_linear_events)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M12 1.5V4.5" stroke="url(#paint1_linear_events)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M6 1.5V4.5" stroke="url(#paint2_linear_events)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M2.25 7.5H15.75" stroke="url(#paint3_linear_events)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Defs>
          <SvgLinearGradient id="paint0_linear_events" x1="9" y1="3" x2="9" y2="16.5">
            <Stop stopColor="#EC4899" />
            <Stop offset="1" stopColor="#BE185D" />
          </SvgLinearGradient>
          <SvgLinearGradient id="paint1_linear_events" x1="12.5" y1="1.5" x2="12.5" y2="4.5">
            <Stop stopColor="#EC4899" />
            <Stop offset="1" stopColor="#BE185D" />
          </SvgLinearGradient>
          <SvgLinearGradient id="paint2_linear_events" x1="6.5" y1="1.5" x2="6.5" y2="4.5">
            <Stop stopColor="#EC4899" />
            <Stop offset="1" stopColor="#BE185D" />
          </SvgLinearGradient>
          <SvgLinearGradient id="paint3_linear_events" x1="9" y1="7.5" x2="9" y2="8.5">
            <Stop stopColor="#EC4899" />
            <Stop offset="1" stopColor="#BE185D" />
          </SvgLinearGradient>
        </Defs>
      </Svg>
    );
  }

  return null;
};

export const CategoryChip: React.FC<CategoryChipProps> = ({ type, label, isSelected, onPress }) => {
  if (isSelected) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 0.233, y: 1.155 }} style={styles.selectedContainer}>
          <Text style={styles.selectedText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.unselectedContainer} activeOpacity={0.7}>
      <CategoryIcon type={type} />
      <Text style={styles.unselectedText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selectedContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedText: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
  },
  unselectedContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.textTertiary,
    backgroundColor: COLORS.backgroundLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unselectedText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
  },
});
