import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';

type ChoiceState = 'default' | 'correct' | 'incorrect' | 'disabled';

type Props = {
  label: string;
  state: ChoiceState;
  onPress: () => void;
};

const ICON: Record<ChoiceState, string | null> = {
  default: null,
  correct: '✓',
  incorrect: '×',
  disabled: null,
};

export default function ChoiceButton({ label, state, onPress }: Props) {
  const icon = ICON[state];

  return (
    <TouchableOpacity
      style={[styles.button, stateStyles[state]]}
      onPress={onPress}
      disabled={state !== 'default'}
      activeOpacity={0.7}
    >
      <View style={styles.inner}>
        {icon && (
          <Text style={[styles.icon, iconColorStyles[state]]}>{icon}</Text>
        )}
        <Text style={[styles.text, textColorStyles[state]]} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  text: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
});

const stateStyles = StyleSheet.create({
  default: {},
  correct: {
    borderColor: Colors.correct,
    backgroundColor: '#1A3A1E',
  },
  incorrect: {
    borderColor: Colors.incorrect,
    backgroundColor: '#3A1A1A',
  },
  disabled: {
    opacity: 0.4,
  },
});

const textColorStyles = StyleSheet.create({
  default: {},
  correct: { color: Colors.correct },
  incorrect: { color: Colors.incorrect },
  disabled: { color: Colors.textDim },
});

const iconColorStyles = StyleSheet.create({
  default: {},
  correct: { color: Colors.correct },
  incorrect: { color: Colors.incorrect },
  disabled: {},
});
