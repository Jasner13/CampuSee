import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder = 'Search...' }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
      />
      <View style={styles.iconContainer}>
        <Svg width="23" height="23" viewBox="0 0 23 23" fill="none">
          <Path
            d="M10.5417 18.2083C14.7758 18.2083 18.2083 14.7758 18.2083 10.5417C18.2083 6.30748 14.7758 2.875 10.5417 2.875C6.30748 2.875 2.875 6.30748 2.875 10.5417C2.875 14.7758 6.30748 18.2083 10.5417 18.2083Z"
            stroke="url(#paint0_linear_search)"
            strokeWidth="1.91667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M15.8345 15.8345L20.125 20.125" stroke="url(#paint0_linear_search)" strokeWidth="1.91667" strokeLinecap="round" strokeLinejoin="round" />
          <Defs>
            <SvgLinearGradient id="paint0_linear_search" x1="10.5417" y1="2.875" x2="10.5417" y2="20.125">
              <Stop stopColor="#FBBF24" />
              <Stop offset="1" stopColor="#F59E0B" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      </View>
      {value.length > 0 && <View style={styles.activeLine} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D3DEE8',
    backgroundColor: COLORS.backgroundLight,
  },
  input: {
    flex: 1,
    paddingHorizontal: 22,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  iconContainer: {
    position: 'absolute',
    right: 18,
    top: 16,
  },
  activeLine: {
    position: 'absolute',
    left: 6,
    bottom: 0,
    width: 302,
    height: 2,
    backgroundColor: '#F59E0B',
  },
});
