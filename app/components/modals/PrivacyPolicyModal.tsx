// app/components/modals/PrivacyPolicyModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ visible, onClose }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handleBarContainer}>
                <View style={styles.handleBar} />
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Privacy Policy</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Feather name="x" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.intro}>
                    Your privacy is important to us. It is CampuSee's policy to respect your privacy regarding any information we may collect from you across our application.
                </Text>

                <View style={styles.section}>
                    <View style={styles.iconHeader}>
                        <Feather name="database" size={18} color={COLORS.primary} style={{marginRight: 8}} />
                        <Text style={styles.sectionHeader}>Information We Collect</Text>
                    </View>
                    <Text style={styles.text}>
                        We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
                    </Text>
                    <Text style={[styles.text, {marginTop: 8}]}>
                        This includes:
                    </Text>
                    <View style={styles.tagContainer}>
                        <View style={styles.tag}><Text style={styles.tagText}>Email</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>Profile Photo</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>University Data</Text></View>
                        <View style={styles.tag}><Text style={styles.tagText}>Usage Data</Text></View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.iconHeader}>
                        <Feather name="lock" size={18} color={COLORS.primary} style={{marginRight: 8}} />
                        <Text style={styles.sectionHeader}>How We Protect Your Data</Text>
                    </View>
                    <Text style={styles.text}>
                        We don't share any personally identifying information publicly or with third-parties, except when required to by law. We adhere to industry-standard security protocols to keep your data safe.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.iconHeader}>
                        <Feather name="share-2" size={18} color={COLORS.primary} style={{marginRight: 8}} />
                        <Text style={styles.sectionHeader}>Third-Party Services</Text>
                    </View>
                    <Text style={styles.text}>
                        Our app may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites and cannot accept responsibility or liability for their respective privacy policies.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.iconHeader}>
                        <Feather name="check-circle" size={18} color={COLORS.primary} style={{marginRight: 8}} />
                        <Text style={styles.sectionHeader}>Your Consent</Text>
                    </View>
                    <Text style={styles.text}>
                        Your continued use of our app will be regarded as acceptance of our practices around privacy and personal information.
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
  intro: {
      fontSize: 15,
      color: COLORS.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
      fontFamily: FONTS.regular,
  },
  section: {
    marginBottom: 28,
  },
  iconHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
  },
  text: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
  },
  tag: {
      backgroundColor: COLORS.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: COLORS.border,
  },
  tagText: {
      fontSize: 12,
      color: COLORS.textPrimary,
      fontWeight: '600',
      fontFamily: FONTS.bold,
  }
});