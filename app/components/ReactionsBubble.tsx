import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  WithSpringConfig
} from 'react-native-reanimated';

const REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Like', color: '#1877F2' },
  { id: 'love', emoji: '❤️', label: 'Love', color: '#F63459' },
  { id: 'haha', emoji: '😆', label: 'Haha', color: '#F7B125' },
  { id: 'wow',  emoji: '😮', label: 'Wow',  color: '#F7B125' },
  { id: 'sad',  emoji: '😢', label: 'Sad',  color: '#F7B125' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: '#E46050' },
];

interface ReactionsBubbleProps {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (reaction: string) => void;
  position: { x: number; y: number };
}

export default function ReactionsBubble({ visible, onClose, onSelectReaction, position }: ReactionsBubbleProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12 } as WithSpringConfig);
    } else {
      scale.value = 0;
    }
  }, [visible]);

  // FIX: Explicitly handle the transform array for TypeScript
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: scale.value,
      transform: [
        { scale: scale.value },
        { translateY: (1 - scale.value) * 10 }
      ] as any // specific cast to avoid strict union type mismatch
    };
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Position the bubble just above the touch point */}
          <Animated.View style={[styles.bubbleContainer, animatedStyle, { top: position.y - 70, left: 20 }]}>
            {REACTIONS.map((reaction, index) => (
              <ReactionItem 
                key={reaction.id} 
                reaction={reaction} 
                index={index} 
                onSelect={() => {
                  onSelectReaction(reaction.id);
                  onClose();
                }} 
              />
            ))}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const ReactionItem = ({ reaction, index, onSelect }: any) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 50, withSpring(1, { damping: 10 } as WithSpringConfig));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }] as any,
  }));

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
      <Animated.View style={[styles.reactionItem, style]}>
        <Text style={styles.emoji}>{reaction.emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)', 
  },
  bubbleContainer: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 280,
  },
  reactionItem: {
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
});