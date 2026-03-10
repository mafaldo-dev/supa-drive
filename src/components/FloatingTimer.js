import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const formatShort = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const FloatingTimer = ({ elapsed, isRunning, onPress, visible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const shouldShow = visible && isRunning;

  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [shouldShow]);

  // Não usa return null — mantém o componente montado pra animação funcionar
  // Usa pointerEvents pra não bloquear toques quando invisível
  return (
    <Animated.View
      pointerEvents={shouldShow ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        bottom: 100,
        right: 20,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        zIndex: 9999,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: 30,
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderWidth: 1.5,
          borderColor: '#4ade80',
          shadowColor: '#4ade80',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 12,
        }}
      >
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' }} />
        <Text style={{
          color: '#4ade80', fontWeight: '800', fontSize: 16,
          fontVariant: ['tabular-nums'], letterSpacing: 1,
        }}>
          {formatShort(elapsed)}
        </Text>
        <MaterialIcons name="directions-car" size={14} color="#4ade80" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingTimer;