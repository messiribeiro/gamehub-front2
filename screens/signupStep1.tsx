/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'react-native';

import { RootStackParamList } from '../navigation';

// Definindo o tipo das props
type Props = StackScreenProps<RootStackParamList, 'SignupStep1'>;

const SignUpStep1 = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');

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
    if (username) { // Verifica se o campo não está vazio
      await AsyncStorage.setItem('username', username); // Armazenar nome de usuário
      navigation.navigate('SignupStep2'); // Navegar para a próxima etapa
    }
  };

  return (
    <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <Text style={styles.title}>Escolha um nome de usuário</Text>
      <Text style={styles.subtitle}>Você pode trocá-lo depois</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        onChangeText={setUsername}
        value={username}
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

export default SignUpStep1;
