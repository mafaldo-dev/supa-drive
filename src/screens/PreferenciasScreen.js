import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
   ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDriverSettings } from '../hooks/useSubscription';
import { usePreferencesStyles } from '../styles/preferenciesStyles';
import { APPS_OPTIONS, CATS_OPTIONS } from '../utils/constants';


const CheckboxGroup = ({ title, options, values = {}, onChange, columns = 2 }) => {
    const { isDark } = useTheme();
    const C = { textPrimary: isDark ? '#f0f0f0' : '#1a1a2e', accent: '#FF6B6B' };
    const toggle = (key) => onChange({ ...values, [key]: !values[key] });

    return (
        <View style={{ marginBottom: 16 }}>
            {title && <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 10 }}>{title}</Text>}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                {Object.entries(options).map(([key, label]) => (
                    <TouchableOpacity key={key} onPress={() => toggle(key)}
                        style={{ width: `${100 / columns}%`, paddingHorizontal: 4, marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 22, height: 22, borderRadius: 4, borderWidth: 2,
                                borderColor: C.accent, justifyContent: 'center', alignItems: 'center',
                                marginRight: 8, backgroundColor: values[key] ? C.accent : 'transparent',
                            }}>
                                {values[key] && <MaterialIcons name="check" size={14} color="#fff" />}
                            </View>
                            <Text style={{ fontSize: 13, color: C.textPrimary }}>{label}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

 const RadioGroup = ({ title, options, value, onChange }) => {
    const { isDark } = useTheme();
    const C = {
        textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
        textSecondary: isDark ? '#8888aa' : '#888899',
        accent: '#FF6B6B',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    };
    return (
        <View style={{ marginBottom: 16 }}>
            {title && <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 10 }}>{title}</Text>}
            <View style={{ flexDirection: 'row', gap: 10 }}>
                {options.map((opt) => (
                    <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)} style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        paddingVertical: 10, borderRadius: 10, gap: 8,
                        backgroundColor: value === opt.value ? 'rgba(255,107,107,0.12)' : 'transparent',
                        borderWidth: 1.5, borderColor: value === opt.value ? C.accent : C.border,
                    }}>
                        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
                            {value === opt.value && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.accent }} />}
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: value === opt.value ? C.accent : C.textSecondary }}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const PreferenciasScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const { settings, isLoading, updateSettings } = useDriverSettings();


  const parseList = (val) => {
    if (!val) return {};
    if (typeof val === 'object' && !Array.isArray(val)) return val;
    if (Array.isArray(val)) return val.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.reduce((acc, k) => ({ ...acc, [k]: true }), {});
      return parsed;
    } catch { return {}; }
  };

  const [formData, setFormData] = useState({
    target_day: 150,
    target_week: 1000,
    target_hour_profit: 25,
    passenger_min_rating: '4.8',
    car_model: '',
    car_type: '',
    car_ownership: 'proprio',
    fuel_km_avg: 12,
    fuel_day_cost: 50,
    rent_week: null,
    car_payment_type: 'semanal',
    car_payment_value: '',
    apps: {},
    categories: {},
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        target_day: settings.target_day || 150,
        target_week: settings.target_week || 1000,
        target_hour_profit: settings.target_hour_profit || 25,
        passenger_min_rating: settings.passenger_min_rating ? String(settings.passenger_min_rating) : '4.8',
        car_model: settings.car_model || '',
        car_type: settings.car_type || '',
        car_ownership: settings.car_ownership || 'proprio',
        fuel_km_avg: settings.fuel_km_avg || 12,
        fuel_day_cost: settings.fuel_day_cost || 50,
        rent_week: settings.rent_week || null,
        car_payment_type: settings.car_payment_type || 'semanal',
        car_payment_value: settings.car_payment_value ? String(settings.car_payment_value) : '',
        apps: parseList(settings.apps),
        categories: parseList(settings.categories),
      });
    }
  }, [settings]);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    header: isDark ? '#16213e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    input: isDark ? '#16213e' : '#f8f8ff',
    success: '#4ade80',
    danger: '#f87171',
  };
  const styles = usePreferencesStyles();
  
  const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const getTagLabels = (objValues, optionsMap) =>
    Object.entries(objValues || {}).filter(([, v]) => v).map(([k]) => optionsMap[k] || k);
  const serializeList = (obj) =>
    JSON.stringify(Object.entries(obj).filter(([, v]) => v).map(([k]) => k));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        passenger_min_rating: parseFloat(formData.passenger_min_rating) || 4.8,
        car_payment_value: parseFloat(formData.car_payment_value) || 0,
        apps: serializeList(formData.apps),
        categories: serializeList(formData.categories),
      };
      const result = await updateSettings(payload);
      if (result?.success) {
        Alert.alert('Sucesso', 'Preferências salvas!');
        setIsEditing(false);
      } else {
        Alert.alert('Erro', result?.message || 'Erro ao salvar');
      }
    } catch {
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  const selectedApps = getTagLabels(formData.apps, APPS_OPTIONS);
  const selectedCats = getTagLabels(formData.categories, CATS_OPTIONS);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <MaterialIcons name="arrow-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferências</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={{ padding: 4 }}>
            <MaterialIcons name="edit" size={22} color={C.accent} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Metas Financeiras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Metas Financeiras</Text>

          <Text style={styles.label}>Meta diária</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={String(formData.target_day)} keyboardType="numeric"
              onChangeText={v => setFormData(p => ({ ...p, target_day: parseFloat(v) || 0 }))}
              placeholder="Ex: 150" placeholderTextColor={C.textSecondary} />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueText}>{fmt(formData.target_day)}</Text></View>
          )}

          <Text style={styles.label}>Meta semanal</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={String(formData.target_week)} keyboardType="numeric"
              onChangeText={v => setFormData(p => ({ ...p, target_week: parseFloat(v) || 0 }))}
              placeholder="Ex: 1000" placeholderTextColor={C.textSecondary} />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueText}>{fmt(formData.target_week)}</Text></View>
          )}

          <Text style={styles.label}>Ganho/hora desejado</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={String(formData.target_hour_profit)} keyboardType="numeric"
              onChangeText={v => setFormData(p => ({ ...p, target_hour_profit: parseFloat(v) || 0 }))}
              placeholder="Ex: 25" placeholderTextColor={C.textSecondary} />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueText}>{fmt(formData.target_hour_profit)}</Text></View>
          )}

          <Text style={styles.label}>Rate mínimo do passageiro</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={String(formData.passenger_min_rating)}
              keyboardType="decimal-pad"
              onChangeText={v => {
                if (v === '' || v === '.' || /^\d+\.?\d{0,1}$/.test(v)) {
                  setFormData(p => ({ ...p, passenger_min_rating: v }));
                }
              }}
              placeholder="Ex: 4.8"
              placeholderTextColor={C.textSecondary}
            />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueText}>⭐ {formData.passenger_min_rating || '—'}</Text></View>
          )}
        </View>

        {/* Veículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Veículo</Text>

          <Text style={styles.label}>Modelo do carro</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={formData.car_model}
              onChangeText={v => setFormData(p => ({ ...p, car_model: v }))}
              placeholder="Ex: Honda Civic" placeholderTextColor={C.textSecondary} />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueTextPlain}>{formData.car_model || 'Não informado'}</Text></View>
          )}

          <Text style={styles.label}>Tipo</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={formData.car_type}
              onChangeText={v => setFormData(p => ({ ...p, car_type: v }))}
              placeholder="Ex: Sedan, Hatch, SUV" placeholderTextColor={C.textSecondary} />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueTextPlain}>{formData.car_type || 'Não informado'}</Text></View>
          )}

          {isEditing ? (
            <RadioGroup
              title="Situação do veículo:"
              options={[
                { value: 'proprio', label: '🏠 Próprio' },
                { value: 'alugado', label: '🔑 Alugado' },
                { value: 'financiado', label: '💳 Financiado' },
              ]}
              value={formData.car_ownership}
              onChange={v => setFormData(p => ({ ...p, car_ownership: v }))}
            />
          ) : (
            <>
              <Text style={styles.label}>Situação do veículo</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueTextPlain}>
                  {formData.car_ownership === 'alugado' ? '🔑 Alugado'
                    : formData.car_ownership === 'financiado' ? '💳 Financiado'
                    : '🏠 Próprio'}
                </Text>
              </View>
            </>
          )}

          {/* Campos condicionais por situação */}
          {formData.car_ownership === 'alugado' && (
            <>
              <Text style={styles.label}>Período do aluguel</Text>
              {isEditing ? (
                <RadioGroup
                  options={[
                    { value: 'semanal', label: '📅 Semanal' },
                    { value: 'mensal', label: '🗓️ Mensal' },
                  ]}
                  value={formData.car_payment_type}
                  onChange={v => setFormData(p => ({ ...p, car_payment_type: v }))}
                />
              ) : (
                <View style={styles.valueBox}>
                  <Text style={styles.valueTextPlain}>
                    {formData.car_payment_type === 'mensal' ? '🗓️ Mensal' : '📅 Semanal'}
                  </Text>
                </View>
              )}
              <Text style={styles.label}>
                Valor do aluguel ({formData.car_payment_type === 'mensal' ? 'mensal' : 'semanal'})
              </Text>
              {isEditing ? (
                <TextInput style={styles.input} value={formData.car_payment_value?.toString() || ''} keyboardType="numeric"
                  onChangeText={v => setFormData(p => ({ ...p, car_payment_value: v }))}
                  placeholder="Ex: 500" placeholderTextColor={C.textSecondary} />
              ) : (
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>{formData.car_payment_value ? fmt(formData.car_payment_value) : '—'}</Text>
                </View>
              )}
            </>
          )}

          {formData.car_ownership === 'financiado' && (
            <>
              <Text style={styles.label}>Parcela mensal do financiamento</Text>
              {isEditing ? (
                <TextInput style={styles.input} value={formData.car_payment_value?.toString() || ''} keyboardType="numeric"
                  onChangeText={v => setFormData(p => ({ ...p, car_payment_value: v }))}
                  placeholder="Ex: 1200" placeholderTextColor={C.textSecondary} />
              ) : (
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>{formData.car_payment_value ? fmt(formData.car_payment_value) : '—'}</Text>
                </View>
              )}
            </>
          )}

          <Text style={styles.label}>Consumo (km/litro)</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={String(formData.fuel_km_avg)} keyboardType="numeric"
              onChangeText={v => setFormData(p => ({ ...p, fuel_km_avg: parseFloat(v) || 0 }))}
              placeholder="Ex: 12" placeholderTextColor={C.textSecondary} />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueTextPlain}>{formData.fuel_km_avg} km/l</Text></View>
          )}

          <Text style={styles.label}>Custo diário combustível</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={String(formData.fuel_day_cost)} keyboardType="numeric"
              onChangeText={v => setFormData(p => ({ ...p, fuel_day_cost: parseFloat(v) || 0 }))}
              placeholder="Ex: 50" placeholderTextColor={C.textSecondary} />
          ) : (
            <View style={styles.valueBox}><Text style={styles.valueText}>{fmt(formData.fuel_day_cost)}</Text></View>
          )}
        </View>

        {/* Apps & Categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Apps & Categorias</Text>

          {isEditing ? (
            <>
              <CheckboxGroup title="Apps que você usa" options={APPS_OPTIONS}
                values={formData.apps} onChange={v => setFormData(p => ({ ...p, apps: v }))} columns={2} />
              <CheckboxGroup title="Categorias disponíveis" options={CATS_OPTIONS}
                values={formData.categories} onChange={v => setFormData(p => ({ ...p, categories: v }))} columns={2} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Apps</Text>
              <View style={styles.tagsRow}>
                {selectedApps.length > 0
                  ? selectedApps.map(a => <View key={a} style={styles.tag}><Text style={styles.tagText}>{a}</Text></View>)
                  : <Text style={styles.emptyText}>Nenhum selecionado</Text>}
              </View>
              <Text style={[styles.label, { marginTop: 14 }]}>Categorias</Text>
              <View style={styles.tagsRow}>
                {selectedCats.length > 0
                  ? selectedCats.map(c => <View key={c} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>)
                  : <Text style={styles.emptyText}>Nenhuma selecionada</Text>}
              </View>
            </>
          )}
        </View>

        {/* Botões */}
        <View style={styles.btnRow}>
          {isEditing ? (
            <>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsEditing(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave} disabled={isSaving}>
                {isSaving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnText}>Salvar Preferências</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => setIsEditing(true)}>
              <Text style={styles.btnText}>✏️ Editar Preferências</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

export default PreferenciasScreen;