import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';

const TrafficModal = ({ visible, onClose, currentRide }) => {
  const getTrafficColor = (s) => {
    const { colors } = useTheme();
    return ({
      green: colors.success,
      yellow: colors.warning,
      red: colors.error,
    }[s] || colors.textSecondary);
  };
  const getTrafficText = (s) => ({ green: 'BOA CORRIDA!', yellow: 'AVALIAR', red: 'EVITAR' }[s] || 'ANALISANDO');

  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.modalContent}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Nova Corrida Detectada!</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {currentRide && (
            <>
              <View style={[globalStyles.trafficLightContainer, { backgroundColor: getTrafficColor(currentRide.trafficLight) + '20' }]}>
                <View style={[globalStyles.trafficLightCircle, { backgroundColor: getTrafficColor(currentRide.trafficLight) }]}>
                  <Text style={globalStyles.trafficLightEmoji}>
                    {currentRide.trafficLight === 'green' ? '✅' : currentRide.trafficLight === 'yellow' ? '⚠️' : '❌'}
                  </Text>
                </View>
                <Text style={[globalStyles.trafficLightText, { color: getTrafficColor(currentRide.trafficLight) }]}>
                  {getTrafficText(currentRide.trafficLight)}
                </Text>
              </View>
              <View style={globalStyles.rideStats}>
                {[
                  { label: 'Valor', value: `R$ ${currentRide.value.toFixed(2)}` },
                  { label: 'Distância', value: `${currentRide.distance} km` },
                  { label: 'R$/km', value: `R$ ${currentRide.valuePerKm}` }
                ].map((s, i) => (
                  <View key={i} style={globalStyles.rideStat}>
                    <Text style={globalStyles.rideStatLabel}>{s.label}</Text>
                    <Text style={globalStyles.rideStatValue}>{s.value}</Text>
                  </View>
                ))}
              </View>
              <View style={globalStyles.modalButtons}>
                <TouchableOpacity style={[globalStyles.modalButton, globalStyles.declineButton]} onPress={onClose}>
                  <Text style={globalStyles.declineButtonText}>Recusar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[globalStyles.modalButton, globalStyles.acceptButton]} onPress={() => { onClose(); Alert.alert('Sucesso!', 'Corrida aceita!', 'success'); }}>
                  <Text style={globalStyles.acceptButtonText}>Aceitar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TrafficModal;