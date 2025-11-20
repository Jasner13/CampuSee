import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface MessageCardProps {
  name: string;
  messagePreview: string;
  time: string;
  initials: string;
  isOnline?: boolean;
  isUnread?: boolean;
  onPress?: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  name,
  messagePreview,
  time,
  initials,
  isOnline = false,
  isUnread = false,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Svg width={41} height={41} viewBox="0 0 41 41">
            <Defs>
              <SvgLinearGradient id="avatarGradient" x1="0" y1="0" x2="9.44104" y2="46.7696" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#667EEA" />
                <Stop offset="1" stopColor="#764BA2" />
              </SvgLinearGradient>
            </Defs>
            <Path 
              d={isOnline 
                ? "M20.25 0C31.4338 0 40.5 9.06623 40.5 20.25C40.5 24.4424 39.2259 28.3371 37.0439 31.5684C35.9773 30.5945 34.5582 30 33 30C29.6863 30 27 32.6863 27 36C27 37.1071 27.3003 38.1439 27.8232 39.0342C25.4836 39.9784 22.9279 40.5 20.25 40.5C9.06623 40.5 0 31.4338 0 20.25C0 9.06623 9.06623 0 20.25 0Z"
                : "M20.25 0C31.4338 0 40.5 9.06623 40.5 20.25C40.5 31.4338 31.4338 40.5 20.25 40.5C9.06623 40.5 0 31.4338 0 20.25C0 9.06623 9.06623 0 20.25 0Z"
              }
              fill="url(#avatarGradient)" 
            />
          </Svg>
          <Text style={styles.initials}>{initials}</Text>
          {isOnline && (
            <View style={styles.onlinePing}>
              <Svg width={9} height={9} viewBox="0 0 9 9">
                <Circle cx="4.5" cy="4.5" r="4.5" fill="#10B981" />
              </Svg>
            </View>
          )}
        </View>
        
        <View style={styles.messageContent}>
          <Text style={[styles.name, isUnread && styles.nameUnread]}>{name}</Text>
          <View style={styles.messageRow}>
            <Text 
              style={[styles.message, isUnread && styles.messageUnread]} 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {messagePreview}
            </Text>
            <Text style={styles.time}>· {time}</Text>
          </View>
        </View>
      </View>
      
      {isUnread && (
        <View style={styles.unreadBadge}>
          <Svg width={12} height={12} viewBox="0 0 12 12">
            <Circle cx="6" cy="6" r="6" fill="#667EEA" />
          </Svg>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 13,
    paddingLeft: 20,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  initials: {
    position: 'absolute',
    left: 9,
    top: 11,
    width: 21,
    height: 20,
    color: COLORS.textLight,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
  },
  onlinePing: {
    position: 'absolute',
    left: 29,
    top: 32,
    width: 9,
    height: 9,
  },
  messageContent: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  nameUnread: {
    fontWeight: '800',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 264,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    maxWidth: 200,
  },
  messageUnread: {
    fontWeight: '700',
  },
  time: {
    color: COLORS.lightGray,
    fontSize: 16,
    fontWeight: '500',
  },
  unreadBadge: {
    width: 12,
    height: 12,
    marginRight: 10,
  },
});
