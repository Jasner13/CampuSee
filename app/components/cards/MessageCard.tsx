import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { Avatar } from '../Avatar';

interface MessageCardProps {
  name: string;
  messagePreview: string;
  time: string;
  initials: string;
  avatarUrl?: string | null; // <--- This prop must be defined here
  isOnline?: boolean;
  isUnread?: boolean;
  onPress?: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  name,
  messagePreview,
  time,
  initials,
  avatarUrl,
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
        <View style={styles.avatarContainer}>
          <Avatar 
            initials={initials} 
            avatarUrl={avatarUrl} 
            size="small" 
          />
          {isOnline && (
            <View style={styles.onlinePing}>
              <Svg width={12} height={12} viewBox="0 0 12 12">
                <Circle cx="6" cy="6" r="5" fill="#10B981" stroke={COLORS.backgroundLight} strokeWidth="2" />
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
    gap: 16,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlinePing: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  messageContent: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  messageUnread: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  time: {
    color: COLORS.lightGray,
    fontSize: 14,
    fontWeight: '500',
  },
  unreadBadge: {
    width: 12,
    height: 12,
    marginRight: 10,
  },
});