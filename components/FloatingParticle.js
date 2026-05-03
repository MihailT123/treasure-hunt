import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function FloatingParticle({ onComplete }) {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(moveAnim, { toValue: -50, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.Text style={[styles.floatingText, { transform: [{ translateY: moveAnim }], opacity: fadeAnim }]}>
      -1
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  floatingText: { position: 'absolute', top: 0, color: '#e74c3c', fontSize: 18, fontWeight: 'bold' }
});