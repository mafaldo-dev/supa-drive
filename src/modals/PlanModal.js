import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';
import { height } from '../utils/constants';

const PlanModal = ({ visible, onClose, userPlan, onSelectPlan, onUpgradeClick }) => {
  const plans = [
    {
      id: 'free',
      name: 'Básico',
      price: 'Grátis',
      features: ['✓ Alerta de área de risco', '✗ Semáforo automático', '✗ Cálculo de R$/km']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 12,90/mês',
      features: ['✓ Alerta de área de risco', '✓ Semáforo automático', '✓ Cálculo de R$/km', '✓ Suporte prioritário', '✓ Sem renovação automática']
    },
  ];

  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={globalStyles.modalOverlay}>
        <View style={[globalStyles.modalContent, { maxHeight: height * 0.8 }]}>
          <View style={globalStyles.modalHeader}>
            <Text style={globalStyles.modalTitle}>Planos Disponíveis</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  globalStyles.planCard,
                  userPlan === plan.id && globalStyles.planCardActive,
                  plan.id === 'premium' && globalStyles.premiumCard
                ]}
                onPress={() => {
                  if (plan.id === 'premium' && userPlan !== 'premium') {
                    onClose();
                    if (onUpgradeClick) onUpgradeClick();
                  } else {
                    onSelectPlan(plan.id);
                  }
                }}
              >
                <Text style={globalStyles.planName}>{plan.name}</Text>
                <Text style={globalStyles.planPrice}>{plan.price}</Text>
                <View style={globalStyles.planFeatures}>
                  {plan.features.map((f, i) => (
                    <Text key={i} style={globalStyles.planFeature}>{f}</Text>
                  ))}
                </View>
                {userPlan === plan.id && (
                  <View style={globalStyles.currentPlanBadge}>
                    <Text style={globalStyles.currentPlanText}>Plano Atual</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PlanModal;