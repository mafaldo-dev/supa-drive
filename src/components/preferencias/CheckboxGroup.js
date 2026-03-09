import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useMemo } from 'react';

const CheckboxGroup = ({ title, options, values, onChange, columns = 2 }) => {
  const toggleCheckbox = (key) => {
    onChange({ ...values, [key]: !values[key] });
  };

  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: { marginBottom: 20 },
    title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
    grid: { marginHorizontal: -8 },
    checkboxItem: { paddingHorizontal: 8, marginBottom: 12 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    checkboxChecked: { backgroundColor: colors.accent },
    checkboxLabel: { fontSize: 14, color: colors.textPrimary, textTransform: 'capitalize' },
  }), [colors]);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.grid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {Object.entries(options).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.checkboxItem,
              { width: `${100 / columns}%` }
            ]}
            onPress={() => toggleCheckbox(key)}
          >
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                values[key] && styles.checkboxChecked
              ]}>
                {values[key] && (
                  <MaterialIcons name="check" size={16} color="#FFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};



export default CheckboxGroup;