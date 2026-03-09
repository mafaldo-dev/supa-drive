import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const PixQRModal = ({ visible, onClose, qrCode, qrCodeBase64, amount, description }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      alignItems: 'center',
      maxWidth: width * 0.9,
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    amount: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.accent,
      marginBottom: 20,
    },
    qrContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
    },
    qrPlaceholder: {
      width: 200,
      height: 200,
      backgroundColor: '#000000',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qrText: {
      color: '#FFFFFF',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
    },
    instructions: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    copyButton: {
      backgroundColor: colors.accent,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      width: '100%',
    },
    copyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const handleCopyPixCode = () => {
    // Implementar cópia para clipboard
    // Clipboard.setString(qrCode);
    alert('Código PIX copiado para a área de transferência!');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Pagamento PIX</Text>
          <Text style={styles.subtitle}>{description}</Text>
          <Text style={styles.amount}>R$ {amount?.toFixed(2)}</Text>

          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <MaterialIcons name="qr-code" size={80} color="#FFFFFF" />
              <Text style={styles.qrText}>QR Code PIX</Text>
            </View>
          </View>

          <Text style={styles.instructions}>
            Abra seu app bancário e escaneie o código acima, ou copie o código PIX abaixo.
          </Text>

          <TouchableOpacity style={styles.copyButton} onPress={handleCopyPixCode}>
            <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PixQRModal;