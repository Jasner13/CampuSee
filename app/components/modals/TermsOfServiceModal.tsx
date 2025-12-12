// app/components/modals/TermsOfServiceModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ visible, onClose }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handleBarContainer}>
                <View style={styles.handleBar} />
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Terms of Service</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Feather name="x" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last updated: December 13, 2025</Text>

                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>At a glance:</Text>
                    <View style={styles.summaryItem}>
                         <Feather name="check" size={16} color={COLORS.success} style={{marginTop: 2}} />
                         <Text style={styles.summaryText}>You own your content.</Text>
                    </View>
                    <View style={styles.summaryItem}>
                         <Feather name="check" size={16} color={COLORS.success} style={{marginTop: 2}} />
                         <Text style={styles.summaryText}>We don't sell your personal data.</Text>
                    </View>
                    <View style={styles.summaryItem}>
                         <Feather name="alert-circle" size={16} color={COLORS.accentDark} style={{marginTop: 2}} />
                         <Text style={styles.summaryText}>Be respectful to other students.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
                    <Text style={styles.text}>
                        By accessing and using CampuSee, you accept and agree to be bound by the terms and provision of this agreement.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>2. Use License</Text>
                    <Text style={styles.text}>
                        Permission is granted to temporarily download one copy of the materials (information or software) on CampuSee's application for personal, non-commercial transitory viewing only.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>3. User Conduct</Text>
                    <Text style={styles.text}>
                        You agree not to use the Service to:
                    </Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>Upload content that is unlawful, harmful, or offensive.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>Impersonate any person or entity or falsely state your affiliation.</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>Harass or bully other users.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>4. Termination</Text>
                    <Text style={styles.text}>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </Text>
                </View>
                
                <View style={{height: 20}} />
            </ScrollView>
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
    height: '85%', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
  },
  closeButton: {
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
  },
  content: {
    padding: 24,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: 20,
    fontStyle: 'italic',
    fontFamily: FONTS.regular,
  },
  summaryContainer: {
      backgroundColor: COLORS.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
  },
  summaryTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 8,
      fontFamily: FONTS.bold,
  },
  summaryItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 4,
  },
  summaryText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginLeft: 8,
      fontFamily: FONTS.regular,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  text: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    fontFamily: FONTS.regular,
  },
  bulletPoint: {
      flexDirection: 'row',
      marginTop: 4,
      paddingLeft: 8,
  },
  bullet: {
      fontSize: 15,
      color: COLORS.textSecondary,
      marginRight: 8,
      lineHeight: 24,
  }
});