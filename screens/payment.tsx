import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'react-native';

import { RootStackParamList } from '../navigation';
import api from '../services/api';

type Props = StackScreenProps<RootStackParamList, 'Payment'>;

const Payment = ({ navigation, route }: Props) => {
  const { type } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);
    };

    fetchUserId();
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      const successUrl = 'https://myapp.com/success';
      const cancelUrl = 'https://myapp.com/cancel';
        console.log(type);
      // Fazer a requisição para o backend e passar os parâmetros necessários
      const response = await api.post('/api/subscriptions/checkout-session', {
        userId: userId,
        type: type,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
      });

      // Extrair a URL do Stripe Checkout diretamente do response.data
      const { url } = response.data;

      // Abre a URL do Stripe Checkout no navegador
      const result = await WebBrowser.openBrowserAsync(url);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('Pagamento foi cancelado ou a página foi fechada');
      } else {
        console.log('Possível sucesso, ou verifique o backend para confirmação');
      }
    } catch (error) {
      console.error('Erro ao inicializar o pagamento:', error);
    }
  };

  return (
    <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <Text>Redirecionando para o pagamento...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Payment;
