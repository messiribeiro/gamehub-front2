import 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import React from 'react';
import { StatusBar } from 'react-native';
import RootStack from '../navigation';

// Configure o prefixo e as rotas para deep linking
const linking = {
  prefixes: ['gamehub://'], // Prefixo da URL personalizada
  config: {
    screens: {
      Home: 'screens/home', // Rota para a tela inicial
      Subscribe: 'screens/subscribe', // Rota para a tela de cancelamento
    },
  },
};

export default function App() {
  return (
    <>
      <StripeProvider publishableKey="pk_test_51QD4evICxiZsBAXRfhZhiSLdpcHqby4tkqgynnxCxwzD7pfls8lyryVhJ6JiaP9Q2YkHfwm9sFCAv30c78KVjCU3005bCNvxmv">
        <StatusBar barStyle="dark-content" backgroundColor="#1B1B1E" />

        <RootStack linking={linking} />
      </StripeProvider>
    </>
  );
}
