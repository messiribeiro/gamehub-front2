import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import axios from 'axios';
import { StatusBar } from 'react-native';

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

import { RootStackParamList } from '../navigation';

// Definindo o tipo das props
type Props = StackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        navigation.replace('Home');
      } else {
        setLoading(false); // Define o loading como false se não houver usuário
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Por favor, insira tanto o nome de usuário quanto a senha');
      return; // Para se o nome de usuário ou a senha estiverem vazios
    }

    try {
      const response = await api.post('/api/auth/login', {
        email: username,
        password,
      });

      // Valida a estrutura da resposta
      if (response.data && response.data.success && response.data.data && response.data.data.user) {
        const user = response.data.data.user;
        const userId = user.id.toString(); // Converte userId para string para AsyncStorage
        const token = response.data.data.token;

        // Salva tanto userId quanto token no AsyncStorage
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('authToken', token);

        console.log('User ID e Token salvos:', userId, token);

        // Navega para a tela Home
        navigation.replace('Home');
      } else {
        console.error('Resposta de login inválida:', response.data);
        Alert.alert('Falha no Login', 'Nome de usuário ou senha inválidos');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Falha no Login', 'Ocorreu um erro durante o login. Por favor, tente novamente.');
    }
  };

  // Se ainda estiver carregando, exibe um indicador de carregamento
  if (loading) {
    return (
      <>
        <View style={styles.loadingContainer} />
        <StatusBar barStyle="dark-content" backgroundColor="#121212" />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <Text style={styles.title}>GameHub</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu e-mail"
        onChangeText={setUsername}
        value={username}
        placeholderTextColor="#fff"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        placeholderTextColor="#fff"
      />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => Alert.alert('vish 😐', 'Ainda não implementamos essa funcionalidade 🤡')}
      >
        <Text style={styles.forgotPasswordText}>Esqueceu a Senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createAccount}
        onPress={() => navigation.navigate('SignupStep1')} // Navega para SignupStep1
      >
        <Text style={styles.createAccountText}>Criar Conta</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
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
  forgotPassword: {
    marginBottom: 15,
    width: '70%',
  },
  forgotPasswordText: {
    color: '#fff',
    alignSelf: 'flex-end',
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
  createAccount: {
    marginTop: 20,
  },
  createAccountText: {
    color: '#fff',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#1B1B1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen;
