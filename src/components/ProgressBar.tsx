import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';

type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: Props) {
  const progress = current / total;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={styles.label}>
        問 {current} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  track: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  label: {
    color: Colors.textDim,
    fontSize: 13,
    textAlign: 'right',
  },
});
