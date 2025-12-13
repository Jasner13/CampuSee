import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface ActionItem {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  isDestructive?: boolean;
}

interface ActionSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionItem[];
}

export const ActionSheetModal: React.FC<ActionSheetModalProps> = ({ visible, onClose, title, actions }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* Handle Bar */}
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Optional Title */}
          {title && (
             <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
             </View>
          )}

          {/* Actions List */}
          <View style={styles.content}>
            {actions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.actionItem} 
                onPress={() => {
                    onClose();
                    // Small delay to allow modal to close smoothly before action triggers
                    setTimeout(() => action.onPress(), 100);
                }}
                activeOpacity={0.7}
              >
                {action.icon && (
                    <View style={styles.iconContainer}>
                        <Ionicons 
                            name={action.icon} 
                            size={24} 
                            color={action.isDestructive ? COLORS.error : COLORS.textPrimary} 
                        />
                    </View>
                )}
                <Text style={[styles.actionLabel, action.isDestructive && styles.destructiveLabel]}>
                    {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Bottom Padding for SafeArea/Look */}
          <View style={{ height: Platform.OS === 'ios' ? 30 : 20 }} /> 
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 0,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    paddingVertical: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
  },
  destructiveLabel: {
    color: COLORS.error,
  }
});