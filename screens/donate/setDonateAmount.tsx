import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect, useId } from 'react';
import { StatusBar, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { RootStackParamList } from '../../navigation';
import api from '@/services/api';

type Props = StackScreenProps<RootStackParamList, 'SetDonateAmount'>;

const SetDonateAmount = ({ navigation, route}: Props) => {
  const { gameId } = route.params;
  const [donationAmount, setDonationAmount] = useState('0,01');
  const [gameData, setGameData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Para indicar o carregamento no envio
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Função para buscar os dados do jogo
    const fetchGameData = async () => {
      try {
        const response = await api.get(`/api/games/${gameId}`);
        const data = await response.data;
        setGameData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do jogo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData(); // Chama a função quando o componente for montado
  }, []);

  const handleInputChange = (value: string) => {
    setDonationAmount(value);
  };

  const handleDonate = async () => {
    setIsProcessing(true); // Inicia o carregamento
  
    try {
      // Recuperando o userId do AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('Usuário não autenticado');
        return;
      }
  
      const amount = parseFloat(donationAmount.replace(',', '.')); // Convertendo o valor da doação para float
      const description = 'Doação para o desenvolvimento do jogo';
      console.log(gameId)
  
      // Enviando os dados para a API para criar a doação
      const response = await api.post('/api/donation', {
        userId,
        gameId: gameId,
        amount,
        description,
        payerEmail: email,  // Agora passando o email
      });
  
      const { init_point } = response.data.result;
      console.log(init_point)
      if (init_point) {
        // Utilizando o Linking para abrir a URL
        Linking.openURL(init_point)
          .catch(err => console.error('Erro ao abrir URL do Mercado Pago:', err));
      } else {
        console.error('Erro ao criar a doação: não foi recebido o link de pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar doação:', error);
    } finally {
      setIsProcessing(false); // Finaliza o carregamento
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B1B1E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <View style={styles.gameImageContainer}>
            <Image
              source={{ uri: gameData?.gameimageUrl }}
              style={styles.gameImage}
            />
          </View>

          <View style={styles.main}>
            <Text style={styles.text}>
              Que legal que você quer apoiar o desenvolvimento do jogo {gameData?.name} 😁
            </Text>

            <Text style={styles.categoryText}>Categoria: {gameData?.category}</Text>

            <View style={styles.setAmountContainer}>
              <Text style={styles.setAmountContainerTitle}>Qual o valor da sua doação?</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={donationAmount}
                  onChangeText={handleInputChange}
                />
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.mailIcon}>
                  <Feather name='mail' size={20} color={"white"} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Seu email"
                  placeholderTextColor="#888"
                  value={email}  // Vincula o estado ao valor do input
                  onChangeText={setEmail}  // Atualiza o estado ao digitar
                />
              </View>
              <Text style={styles.message}>Só aceitamos pagamentos via pix</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleDonate} disabled={isProcessing}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ir para o pagamento</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingTop: '6%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
  },
  button: {
    backgroundColor: '#5312C2',
    width: '90%',
    height: 45,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gameImageContainer: {
    position: 'absolute',
    width: '100%',
    height: '18%',
  },
  gameImage: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  main: {
    marginTop: '25%',
    paddingHorizontal: '5%',
  },
  text: {
    color: 'white',
  },
  categoryText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  setAmountContainer: {
    marginTop: 40,
  },
  setAmountContainerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
  },
  currencySymbol: {
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  message: {
    color: "white",
    fontSize: 14,
    opacity: 0.2,
    marginTop: 10,
  },
  mailIcon: {
    marginRight: 10,
  },

});

export default SetDonateAmount;
