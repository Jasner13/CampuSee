// app/components/modals/HelpSupportModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const FAQS: FAQItem[] = [
    {
        id: 1,
        question: "How do I change my password?",
        answer: "Navigate to Settings > Account > Change Password. You'll need to enter your current password to set a new one."
    },
    {
        id: 2,
        question: "Who can see my posts?",
        answer: "By default, your posts are visible to everyone on your campus. You can change visibility settings when creating a post or edit them later."
    },
    {
        id: 3,
        question: "How do I report a user or post?",
        answer: "Tap the three dots (...) icon on any post or profile to access the reporting menu. Our moderation team reviews all reports within 24 hours."
    },
    {
        id: 4,
        question: "Can I delete my account?",
        answer: "Yes. Please contact our support team directly via email to initiate the permanent account deletion process."
    }
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ visible, onClose }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@campusee.edu');
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            {/* Drag Handle */}
            <View style={styles.handleBarContainer}>
                <View style={styles.handleBar} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Help & Support</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Feather name="x" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Contact Card */}
                <View style={styles.contactCard}>
                    <View style={styles.contactHeaderRow}>
                        <View style={styles.contactIconBg}>
                            <Feather name="headphones" size={24} color={COLORS.primary} />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.contactTitle}>Need more help?</Text>
                            <Text style={styles.contactSubtitle}>Our team is available 24/7.</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleEmailSupport} activeOpacity={0.8}>
                        <Text style={styles.primaryButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
                
                {FAQS.map((item) => {
                    const isExpanded = expandedId === item.id;
                    return (
                        <TouchableOpacity 
                            key={item.id} 
                            style={[styles.faqItem, isExpanded && styles.faqItemActive]} 
                            onPress={() => toggleExpand(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.questionText, isExpanded && styles.questionTextActive]}>
                                    {item.question}
                                </Text>
                                <Feather 
                                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={isExpanded ? COLORS.primary : COLORS.textTertiary} 
                                />
                            </View>
                            {isExpanded && (
                                <Text style={styles.answerText}>
                                    {item.answer}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.footer}>
                    <Text style={styles.versionText}>App Version 1.0.0</Text>
                </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  contactCard: {
    backgroundColor: '#EEF2FF', // Very light primary
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  contactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 12,
    fontFamily: FONTS.bold,
  },
  faqItem: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFC',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
    fontFamily: FONTS.bold,
  },
  questionTextActive: {
    color: COLORS.primary,
  },
  answerText: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  footer: {
      marginTop: 24,
      alignItems: 'center',
  },
  versionText: {
      fontSize: 12,
      color: COLORS.textTertiary,
      fontFamily: FONTS.regular,
  }
});