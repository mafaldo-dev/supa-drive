import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';
import { width, height } from '../utils/constants';

const FloatingButton = ({ onPress, badgeCount = 0 }) => {
  const pan = useRef(new Animated.ValueXY({ x: width - 80, y: height / 2 })).current;
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        let newX = pan.x._value;
        let newY = pan.y._value;
        if (newX < 0) newX = 0;
        if (newX > width - 70) newX = width - 70;
        if (newY < 40) newY = 40;
        if (newY > height - 100) newY = height - 100;
        pan.setValue({ x: newX, y: newY });
      }
    })
  ).current;

  return (
    <Animated.View style={[globalStyles.floatingButton, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...panResponder.panHandlers}>
      <TouchableOpacity style={globalStyles.floatingButtonContent} onPress={onPress}>
        <FontAwesome5 name="taxi" size={24} color="#fff" />
        {badgeCount > 0 && (
          <View style={globalStyles.floatingBadge}>
            <Text style={globalStyles.floatingBadgeText}>{badgeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingButton;