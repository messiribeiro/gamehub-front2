import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'react-native';

import { RootStackParamList } from '../navigation';
import api from '../services/api'; // Importa a instância configurada

// Definindo o tipo das props
type Props = StackScreenProps<RootStackParamList, 'SignupStep3'>;

const SignUpStep3 = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('useId');
      if (token) {
        navigation.replace('Home');
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('🙄', 'insira um email válido.');
      return;
    }

    try {
      // Save email to AsyncStorage
      await AsyncStorage.setItem('email', email);

      // Navigate to GameSelect
      navigation.navigate('GameSelect');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao processar sua solicitação.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <Text style={styles.title}>Informe seu email</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        placeholderTextColor="#fff"
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Avançar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    width: '60%',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 35,
  },
  input: {
    width: '70%',
    height: 50,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    marginBottom: 15,
    color: '#fff',
    borderColor: 'white',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#512DA8',
    padding: 15,
    borderRadius: 50,
    width: '70%',
    height: 50,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default SignUpStep3;
