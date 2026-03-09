import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import swal from 'sweetalert2';
import { useTheme } from '../context/ThemeContext';
import { useGlobalStyles } from '../styles/useGlobalStyles';


const PromocoesScreen = () => {
	const globalStyles = useGlobalStyles();
	const { colors } = useTheme();
	const [userTake, setUserTake] = useState(false)
	const [count, setCount] = useState(0)

const userTakeYourPromotionalCode = () => {
	if(count === 0) {
		setUserTake(!userTake)
		setCount(1)
		swal.fire('Sucesso!', 'Parabens🎉🎉🎉... Regaste efetuado com sucesso! Aproveite seu mês grátis', 'success')
	} else if(count != 0) {
		swal.fire('Cupom', 'Esse cupóm ja foi resgatado, Aguarde as proximas promoções!', 'info')
	}
}
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.screenTitle}>Promoções</Text>
      <View style={globalStyles.promoCard}>
        <Text style={globalStyles.promoEmoji}>🎉</Text>
        <Text style={globalStyles.promoTitle}>1 mês Premium grátis!</Text>
        <Text style={globalStyles.promoSub}>Use o código: SUPA26</Text>
        <TouchableOpacity 
		onPress={userTakeYourPromotionalCode}
		style={[globalStyles.promoBtn, count > 0 && { backgroundColor: colors.textSecondary }]}		disabled={userTake}
	>
          <Text style={globalStyles.promoBtnText}>{userTake ? 'Ja resgatado': 'Resgatar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PromocoesScreen;
