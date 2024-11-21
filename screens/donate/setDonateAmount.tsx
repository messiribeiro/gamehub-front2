import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { RootStackParamList } from '../../navigation';

type Props = StackScreenProps<RootStackParamList, 'SetDonateAmount'>;

const SetDonateAmount = ({ navigation }: Props) => {
  // Define o valor inicial como 0,01
  const [donationAmount, setDonationAmount] = useState('0,01');

  const handleInputChange = (value: string) => {
    // Atualiza o valor da doação
    setDonationAmount(value);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B1B1E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.gameImageContainer}>
        <Image
          source={{
            uri: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5cd1f6af-ed85-437b-ba2a-131693b7f3d8/dgj3kny-2ee3a0e9-ee94-4add-b61b-7d99f2858614.png/v1/fill/w_1280,h_1280,q_80,strp/gta_6_logo__4k__by_giga_bitten_dgj3kny-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcLzVjZDFmNmFmLWVkODUtNDM3Yi1iYTJhLTEzMTY5M2I3ZjNkOFwvZGdqM2tueS0yZWUzYTBlOS1lZTk0LTRhZGQtYjYxYi03ZDk5ZjI4NTg2MTQucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.2lLFlLqUI0F3Efblkgpp2kzZFgVwuMphRh8VyWy6d5A',
          }}
          style={styles.gameImage}
        />
      </View>
      <View style={styles.main}>
        <Text style={styles.text}>Que legal que você quer apoiar o desenvolvimento do jogo GTA VI 😁</Text>
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
          <Text style={styles.message}>Só aceitamos pagamentos via pix</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ir para o pagamento</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  }
});

export default SetDonateAmount;
