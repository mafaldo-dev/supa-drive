import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import CheckboxGroup from './CheckboxGroup';
import { useTheme } from '../../context/ThemeContext';
import { useMemo } from 'react';

const InformacoesVeiculo = ({ preferences, isEditing, onChange, updateNested }) => {
  const combustiveis = ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'GNV', 'Elétrico'];

  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    inputContainer: {
      marginBottom: 16,
    },
    rowContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    valueText: {
      fontSize: 16,
      color: colors.textPrimary,
      paddingVertical: 8,
    },
    infoSection: {
      marginTop: 16,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    tag: {
      backgroundColor: colors.accentLight,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
    },
    tagText: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: '600',
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontStyle: 'italic',
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações do Veículo</Text>

      {/* Modelo do Carro */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Modelo do carro</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={preferences.modeloCarro}
            onChangeText={(text) => onChange('modeloCarro', text)}
            placeholder="Ex: Toyota Corolla 2020"
          />
        ) : (
          <Text style={styles.valueText}>
            {preferences.modeloCarro || 'Não informado'}
          </Text>
        )}
      </View>

      {/* Tipo de Combustível */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tipo de combustível</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={preferences.tipoCombustivel}
            onChangeText={(text) => onChange('tipoCombustivel', text)}
            placeholder={combustiveis.join(' • ')}
          />
        ) : (
          <Text style={styles.valueText}>
            {preferences.tipoCombustivel || 'Não informado'}
          </Text>
        )}
      </View>

      {/* Metas Mensais */}
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Meta do mês (R$)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={preferences.metaMensal}
              onChangeText={(text) => onChange('metaMensal', text)}
              keyboardType="numeric"
              placeholder="0,00"
            />
          ) : (
            <Text style={styles.valueText}>
              {preferences.metaMensal ? `R$ ${preferences.metaMensal}` : 'Não definida'}
            </Text>
          )}
        </View>

        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Gastos do mês (R$)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={preferences.gastosMensais}
              onChangeText={(text) => onChange('gastosMensais', text)}
              keyboardType="numeric"
              placeholder="0,00"
            />
          ) : (
            <Text style={styles.valueText}>
              {preferences.gastosMensais ? `R$ ${preferences.gastosMensais}` : 'Não informado'}
            </Text>
          )}
        </View>
      </View>

      {/* Apps que usa */}
      {isEditing && (
        <>
          <CheckboxGroup
            title="Apps que você usa"
            options={{
              uber: 'Uber',
              '99': '99',
              indrive: 'inDrive',
              lalamove: 'Lalamove',
            }}
            values={preferences.appsUsados}
            onChange={(newValues) => updateNested('appsUsados', newValues)}
            columns={2}
          />

          <CheckboxGroup
            title="Categorias disponíveis"
            options={{
              uberx: 'UberX',
              '99pop': '99Pop',
              comfort: 'Comfort',
              black: 'Black',
              entregas: 'Entregas',
              taxi: 'Taxi',
              flash: 'Flash',
              vip: 'VIP',
            }}
            values={preferences.categorias}
            onChange={(newValues) => updateNested('categorias', newValues)}
            columns={2}
          />
        </>
      )}

      {/* Exibição dos apps selecionados quando não está editando */}
      {!isEditing && (
        <>
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Apps utilizados:</Text>
            <View style={styles.tagContainer}>
              {Object.entries(preferences.appsUsados)
                .filter(([_, value]) => value)
                .map(([key]) => (
                  <View key={key} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {key === '99' ? '99' : key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                ))}
              {!Object.values(preferences.appsUsados).some(v => v) && (
                <Text style={styles.emptyText}>Nenhum app selecionado</Text>
              )}
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Categorias disponíveis:</Text>
            <View style={styles.tagContainer}>
              {Object.entries(preferences.categorias)
                .filter(([_, value]) => value)
                .map(([key]) => (
                  <View key={key} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {key === '99pop' ? '99Pop' : 
                       key === 'uberx' ? 'UberX' :
                       key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                ))}
              {!Object.values(preferences.categorias).some(v => v) && (
                <Text style={styles.emptyText}>Nenhuma categoria selecionada</Text>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
};



export default InformacoesVeiculo;
