// app/components/BottomNav.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'; // Import this
import { GRADIENTS, COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

// Remove the old interface and use BottomTabBarProps
export const BottomNav: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  
  // Helper to determine if a route is focused
  const isFocused = (index: number) => state.index === index;

  // Helper to handle navigation
  const handlePress = (routeIndex: number, routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[routeIndex].key,
      canPreventDefault: true,
    });

    if (!isFocused(routeIndex) && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.importantCircle} />

      {/* --- LEFT GROUP (Home + Messages) --- */}
      
      {/* 1. HOME TAB (Index 0 based on MainNavigator) */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress(0, 'Home')} 
        activeOpacity={0.7}
      >
        {isFocused(0) ? (
          <>
            <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M6 28.5V15C6 14.525 6.1065 14.075 6.3195 13.65C6.5325 13.225 6.826 12.875 7.2 12.6L16.2 5.85C16.725 5.45 17.325 5.25 18 5.25C18.675 5.25 19.275 5.45 19.8 5.85L28.8 12.6C29.175 12.875 29.469 13.225 29.682 13.65C29.895 14.075 30.001 14.525 30 15V28.5C30 29.325 29.706 30.0315 29.118 30.6195C28.53 31.2075 27.824 31.501 27 31.5H22.5C22.075 31.5 21.719 31.356 21.432 31.068C21.145 30.78 21.001 30.424 21 30V22.5C21 22.075 20.856 21.719 20.568 21.432C20.28 21.145 19.924 21.001 19.5 21H16.5C16.075 21 15.719 21.144 15.432 21.432C15.145 21.72 15.001 22.076 15 22.5V30C15 30.425 14.856 30.7815 14.568 31.0695C14.28 31.3575 13.924 31.501 13.5 31.5H9C8.175 31.5 7.469 31.2065 6.882 30.6195C6.295 30.0325 6.001 29.326 6 28.5Z" fill="url(#paint0_linear_home)"/>
              <Defs>
                <SvgLinearGradient id="paint0_linear_home" x1="6" y1="5.25" x2="12.6418" y2="35.3325">
                  <Stop stopColor="#667EEA" />
                  <Stop offset="1" stopColor="#764BA2" />
                </SvgLinearGradient>
              </Defs>
            </Svg>
            <Text style={styles.selectedText}>Home</Text>
          </>
        ) : (
          <>
            <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M6 28.5V15C6 14.525 6.1065 14.075 6.3195 13.65C6.5325 13.225 6.826 12.875 7.2 12.6L16.2 5.85C16.725 5.45 17.325 5.25 18 5.25C18.675 5.25 19.275 5.45 19.8 5.85L28.8 12.6C29.175 12.875 29.469 13.225 29.682 13.65C29.895 14.075 30.001 14.525 30 15V28.5C30 29.325 29.706 30.0315 29.118 30.6195C28.53 31.2075 27.824 31.501 27 31.5H22.5C22.075 31.5 21.719 31.356 21.432 31.068C21.145 30.78 21.001 30.424 21 30V22.5C21 22.075 20.856 21.719 20.568 21.432C20.28 21.145 19.924 21.001 19.5 21H16.5C16.075 21 15.719 21.144 15.432 21.432C15.145 21.72 15.001 22.076 15 22.5V30C15 30.425 14.856 30.7815 14.568 31.0695C14.28 31.3575 13.924 31.501 13.5 31.5H9C8.175 31.5 7.469 31.2065 6.882 30.6195C6.295 30.0325 6.001 29.326 6 28.5Z" fill={COLORS.textTertiary}/>
            </Svg>
            <Text style={styles.unselectedText}>Home</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 2. MESSAGES TAB (Index 1) */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress(1, 'Messages')} 
        activeOpacity={0.7}
      >
        {isFocused(1) ? (
          <>
             <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M12 13.5H24M12 19.5H21M27 6C28.1935 6 29.3381 6.47411 30.182 7.31802C31.0259 8.16193 31.5 9.30653 31.5 10.5V22.5C31.5 23.6935 31.0259 24.8381 30.182 25.682C29.3381 26.5259 28.1935 27 27 27H19.5L12 31.5V27H9C7.80653 27 6.66193 26.5259 5.81802 25.682C4.97411 24.8381 4.5 23.6935 4.5 22.5V10.5C4.5 9.30653 4.97411 8.16193 5.81802 7.31802C6.66193 6.47411 7.80653 6 9 6H27Z" stroke="url(#msg_gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <Defs>
                <SvgLinearGradient id="msg_gradient" x1="6" y1="5" x2="30" y2="30">
                  <Stop stopColor="#667EEA" />
                  <Stop offset="1" stopColor="#764BA2" />
                </SvgLinearGradient>
              </Defs>
            </Svg>
            <Text style={styles.selectedText}>Messages</Text>
          </>
        ) : (
          <>
            <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M12 13.5H24M12 19.5H21M27 6C28.1935 6 29.3381 6.47411 30.182 7.31802C31.0259 8.16193 31.5 9.30653 31.5 10.5V22.5C31.5 23.6935 31.0259 24.8381 30.182 25.682C29.3381 26.5259 28.1935 27 27 27H19.5L12 31.5V27H9C7.80653 27 6.66193 26.5259 5.81802 25.682C4.97411 24.8381 4.5 23.6935 4.5 22.5V10.5C4.5 9.30653 4.97411 8.16193 5.81802 7.31802C6.66193 6.47411 7.80653 6 9 6H27Z" stroke={COLORS.textTertiary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.unselectedText}>Messages</Text>
          </>
        )}
      </TouchableOpacity>

      {/* --- MIDDLE SPACER --- */}
      <View style={styles.spacer} />

      {/* 3. CENTER CREATE BUTTON (Index 2 - CreatePost) */}
      <TouchableOpacity 
        style={styles.createButton} 
        onPress={() => handlePress(2, 'CreatePost')} 
        activeOpacity={0.8}
      >
        <LinearGradient 
          colors={GRADIENTS.primary} 
          style={styles.createButtonGradient}
        >
          <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <Path d="M24.0001 17.3307H17.3334V23.9974C17.3334 24.351 17.1929 24.6902 16.9429 24.9402C16.6928 25.1903 16.3537 25.3307 16.0001 25.3307C15.6465 25.3307 15.3073 25.1903 15.0573 24.9402C14.8072 24.6902 14.6667 24.351 14.6667 23.9974V17.3307H8.00008C7.64646 17.3307 7.30732 17.1903 7.05727 16.9402C6.80722 16.6902 6.66675 16.351 6.66675 15.9974C6.66675 15.6438 6.80722 15.3046 7.05727 15.0546C7.30732 14.8045 7.64646 14.6641 8.00008 14.6641H14.6667V7.9974C14.6667 7.64377 14.8072 7.30463 15.0573 7.05459C15.3073 6.80454 15.6465 6.66406 16.0001 6.66406C16.3537 6.66406 16.6928 6.80454 16.9429 7.05459C17.1929 7.30463 17.3334 7.64377 17.3334 7.9974V14.6641H24.0001C24.3537 14.6641 24.6928 14.8045 24.9429 15.0546C25.1929 15.3046 25.3334 15.6438 25.3334 15.9974C25.3334 16.351 25.1929 16.6902 24.9429 16.9402C24.6928 17.1903 24.3537 17.3307 24.0001 17.3307Z" fill="white"/>
          </Svg>
        </LinearGradient>
      </TouchableOpacity>

      {/* --- RIGHT GROUP (Notifications + Profile) --- */}

      {/* 4. NOTIFICATIONS TAB (Index 3) */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress(3, 'Notifications')} 
        activeOpacity={0.7}
      >
        {isFocused(3) ? (
          <>
            <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M13.5 25.5V27C13.5 28.1935 13.9741 29.3381 14.818 30.182C15.6619 31.0259 16.8065 31.5 18 31.5C19.1935 31.5 20.3381 31.0259 21.182 30.182C22.0259 29.3381 22.5 28.1935 22.5 27V25.5M15 7.5C15 6.70435 15.3161 5.94129 15.8787 5.37868C16.4413 4.81607 17.2044 4.5 18 4.5C18.7956 4.5 19.5587 4.81607 20.1213 5.37868C20.6839 5.94129 21 6.70435 21 7.5C22.7226 8.31454 24.1911 9.58249 25.2481 11.1679C26.305 12.7534 26.9107 14.5966 27 16.5V21C27.1129 21.9326 27.4432 22.8256 27.9642 23.6072C28.4853 24.3888 29.1826 25.0371 30 25.5H6C6.81741 25.0371 7.51471 24.3888 8.03578 23.6072C8.55685 22.8256 8.88712 21.9326 9 21V16.5C9.08934 14.5966 9.69495 12.7534 10.7519 11.1679C11.8089 9.58249 13.2774 8.31454 15 7.5Z" stroke="url(#notif_gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <Defs>
                <SvgLinearGradient id="notif_gradient" x1="6" y1="5" x2="30" y2="30">
                  <Stop stopColor="#667EEA" />
                  <Stop offset="1" stopColor="#764BA2" />
                </SvgLinearGradient>
              </Defs>
            </Svg>
            <Text style={styles.selectedText}>Notifications</Text>
          </>
        ) : (
          <>
            <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M13.5 25.5V27C13.5 28.1935 13.9741 29.3381 14.818 30.182C15.6619 31.0259 16.8065 31.5 18 31.5C19.1935 31.5 20.3381 31.0259 21.182 30.182C22.0259 29.3381 22.5 28.1935 22.5 27V25.5M15 7.5C15 6.70435 15.3161 5.94129 15.8787 5.37868C16.4413 4.81607 17.2044 4.5 18 4.5C18.7956 4.5 19.5587 4.81607 20.1213 5.37868C20.6839 5.94129 21 6.70435 21 7.5C22.7226 8.31454 24.1911 9.58249 25.2481 11.1679C26.305 12.7534 26.9107 14.5966 27 16.5V21C27.1129 21.9326 27.4432 22.8256 27.9642 23.6072C28.4853 24.3888 29.1826 25.0371 30 25.5H6C6.81741 25.0371 7.51471 24.3888 8.03578 23.6072C8.55685 22.8256 8.88712 21.9326 9 21V16.5C9.08934 14.5966 9.69495 12.7534 10.7519 11.1679C11.8089 9.58249 13.2774 8.31454 15 7.5Z" stroke={COLORS.textTertiary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
            <Text style={styles.unselectedText}>Notifications</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 5. PROFILE TAB (Index 4) */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handlePress(4, 'Profile')} 
        activeOpacity={0.7}
      >
        {isFocused(4) ? (
          <>
            <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M18 18C16.35 18 14.9375 17.4125 13.7625 16.2375C12.5875 15.0625 12 13.65 12 12C12 10.35 12.5875 8.9375 13.7625 7.7625C14.9375 6.5875 16.35 6 18 6C19.65 6 21.0625 6.5875 22.2375 7.7625C23.4125 8.9375 24 10.35 24 12C24 13.65 23.4125 15.0625 22.2375 16.2375C21.0625 17.4125 19.65 18 18 18ZM6 27V25.8C6 24.95 6.219 24.169 6.657 23.457C7.095 22.745 7.676 22.201 8.4 21.825C9.95 21.05 11.525 20.469 13.125 20.082C14.725 19.695 16.35 19.501 18 19.5C19.65 19.499 21.275 19.693 22.875 20.082C24.475 20.471 26.05 21.052 27.6 21.825C28.325 22.2 28.9065 22.744 29.3445 23.457C29.7825 24.17 30.001 24.951 30 25.8V27C30 27.825 29.7065 28.5315 29.1195 29.1195C28.5325 29.7075 27.826 30.001 27 30H9C8.175 30 7.469 29.7065 6.882 29.1195C6.295 28.5325 6.001 27.826 6 27ZM18 15C18.825 15 19.5315 14.7065 20.1195 14.1195C20.7075 13.5325 21.001 12.826 21 12C20.999 11.174 20.7055 10.468 20.1195 9.882C19.5335 9.296 18.827 9.002 18 9C17.173 8.998 16.467 9.292 15.882 9.882C15.297 10.472 15.003 11.178 15 12C14.997 12.822 15.291 13.5285 15.882 14.1195C16.473 14.7105 17.179 15.004 18 15Z" fill="url(#profile_gradient)"/>
              <Defs>
                <SvgLinearGradient id="profile_gradient" x1="6" y1="6" x2="30" y2="30">
                  <Stop stopColor="#667EEA" />
                  <Stop offset="1" stopColor="#764BA2" />
                </SvgLinearGradient>
              </Defs>
            </Svg>
            <Text style={styles.selectedText}>Profile</Text>
          </>
        ) : (
          <>
            <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <Path d="M18 18C16.35 18 14.9375 17.4125 13.7625 16.2375C12.5875 15.0625 12 13.65 12 12C12 10.35 12.5875 8.9375 13.7625 7.7625C14.9375 6.5875 16.35 6 18 6C19.65 6 21.0625 6.5875 22.2375 7.7625C23.4125 8.9375 24 10.35 24 12C24 13.65 23.4125 15.0625 22.2375 16.2375C21.0625 17.4125 19.65 18 18 18ZM6 27V25.8C6 24.95 6.219 24.169 6.657 23.457C7.095 22.745 7.676 22.201 8.4 21.825C9.95 21.05 11.525 20.469 13.125 20.082C14.725 19.695 16.35 19.501 18 19.5C19.65 19.499 21.275 19.693 22.875 20.082C24.475 20.471 26.05 21.052 27.6 21.825C28.325 22.2 28.9065 22.744 29.3445 23.457C29.7825 24.17 30.001 24.951 30 25.8V27C30 27.825 29.7065 28.5315 29.1195 29.1195C28.5325 29.7075 27.826 30.001 27 30H9C8.175 30 7.469 29.7065 6.882 29.1195C6.295 28.5325 6.001 27.826 6 27ZM18 15C18.825 15 19.5315 14.7065 20.1195 14.1195C20.7075 13.5325 21.001 12.826 21 12C20.999 11.174 20.7055 10.468 20.1195 9.882C19.5335 9.296 18.827 9.002 18 9C17.173 8.998 16.467 9.292 15.882 9.882C15.297 10.472 15.003 11.178 15 12C14.997 12.822 15.291 13.5285 15.882 14.1195C16.473 14.7105 17.179 15.004 18 15Z" fill={COLORS.textTertiary}/>
            </Svg>
            <Text style={styles.unselectedText}>Profile</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.backgroundLight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 14,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  spacer: {
    width: 70, // Gap for the center button
  },
  importantCircle: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.backgroundLight,
    top: -40,
    left: '50%',
    marginLeft: -44, // Centered (-88/2)
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  createButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    top: -29,
    left: '50%',
    marginLeft: -32, // Centered (-64/2)
  },
  createButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '400',
    color: COLORS.primary,
  },
  unselectedText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '400',
    color: COLORS.textTertiary,
  },
});