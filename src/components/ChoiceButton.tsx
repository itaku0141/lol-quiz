import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

type ChoiceState = 'default' | 'correct' | 'incorrect' | 'disabled';

type Props = {
  label: string;
  state: ChoiceState;
  onPress: () => void;
};

export default function ChoiceButton({ label, state, onPress }: Props) {
  const containerStyle = [styles.button, stateStyles[state]];
  const textStyle = [styles.text, state === 'disabled' ? styles.textDisabled : null];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={state !== 'default'}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{label}</Text>
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
  text: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  textDisabled: {
    color: Colors.textDim,
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
