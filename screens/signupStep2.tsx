/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'react-native';

import { RootStackParamList } from '../navigation';

// Definindo o tipo das props
type Props = StackScreenProps<RootStackParamList, 'SignupStep2'>;

const SignUpStep2 = ({ navigation }: Props) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('useId');
      if (token) {
        
        navigation.replace('Home');
      }
    };
    
    checkLoginStatus();
  }, [navigation]);

  const handleNext = async () => {
    if (password.length < 8) {
      Alert.alert('🔒', 'Sua senha deve ter, no mínimo, 8 caracteres.');
      return;
    }

    try {
      // Salvar a senha no AsyncStorage
      await AsyncStorage.setItem('password', password);

      // Navegar para a próxima tela
      navigation.navigate('SignupStep3');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a senha.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <Text style={styles.title}>Crie uma senha</Text>
      <Text style={styles.subtitle}>Sua senha deve ter, no mínimo, 8 caracteres</Text>

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
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
    width: "50%",
    fontWeight: 'bold',
    color: '#fff',
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "200",
    color: '#fff',
    marginBottom: 30,
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

export default SignUpStep2;
