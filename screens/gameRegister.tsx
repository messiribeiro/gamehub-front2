import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import {Feather} from '@expo/vector-icons';

import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'GameRegister'>;

const GameRegister = ({ navigation, route }: Props) => {
  const [selectedValue, setSelectedValue] = useState('Battle Royale');
  const [gameName, setGameName] = useState<string>('');
  const [gameDescription, setGameDescription] = useState<string>('');
  const [gameCategory, setGameCategory] = useState<string>(selectedValue);
  const [gameImage, setGameImage] = useState<string | null>(null);

  // Função para limpar os dados do AsyncStorage
  const clearAsyncStorageData = async () => {
    await AsyncStorage.removeItem('gameName');
    await AsyncStorage.removeItem('gameDescription');
    await AsyncStorage.removeItem('gameCategory');
    await AsyncStorage.removeItem('gameImage');
  };

  // Handler para o BackHandler
  const handleBackPress = () => {
    clearAsyncStorageData(); // Limpa os dados
    navigation.goBack(); // Retorna à tela anterior
    return true; // Impede a ação padrão
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      backHandler.remove(); // Remove o listener quando o componente é desmontado
    };
  }, []);

  async function handleGallery() {
    await AsyncStorage.setItem('gameName', gameName);
    await AsyncStorage.setItem('gameDescription', gameDescription);
    await AsyncStorage.setItem('gameCategory', gameCategory);

    navigation.navigate('GameImageSelect');
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedGameName = await AsyncStorage.getItem('gameName');
        const storedGameDescription = await AsyncStorage.getItem('gameDescription');
        const storedGameCategory = await AsyncStorage.getItem('gameCategory');

        // Certifique-se de definir os estados apenas com strings
        if (storedGameName !== null) setGameName(storedGameName);
        if (storedGameDescription !== null) setGameDescription(storedGameDescription);
        if (storedGameCategory !== null) setGameCategory(storedGameCategory);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData(); // Chame a função para buscar os dados
  }, []);

  useEffect(() => {
    if (route.params?.imageUri) {
      setGameImage(route.params.imageUri);
    }
  }, [route.params]);

  async function handleProgress() {
    if (!gameName || !gameDescription || !gameCategory || !gameImage) {
      Alert.alert(
        'Dados Incompletos',
        'Por favor, preencha todos os campos obrigatórios.', // Mensagem do alerta
        [{ text: 'OK' }]
      );
      return;
    }

    await AsyncStorage.setItem('gameName', gameName);
    await AsyncStorage.setItem('gameDescription', gameDescription);
    await AsyncStorage.setItem('gameCategory', gameCategory);
    await AsyncStorage.setItem('gameImage', gameImage);
    navigation.navigate('GamePreview');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <View style={styles.header} />
      <Text style={styles.title}>Informe os dados do seu jogo</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#A5A5A5"
          placeholder="Nome"
          value={gameName}
          onChangeText={setGameName}
        />

        <View style={styles.textArea}>
          <ScrollView>
            <TextInput
              style={styles.descriptionInput}
              placeholderTextColor="#A5A5A5"
              placeholder="Descrição"
              multiline
              value={gameDescription}
              onChangeText={setGameDescription}
            />
          </ScrollView>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            style={styles.picker}
            onValueChange={(itemValue) => {
              setSelectedValue(itemValue);
              setGameCategory(itemValue);
            }}>
            {/* Opções do Picker */}
            <Picker.Item label="Ação" value="Ação" />
            <Picker.Item label="Aventura" value="Aventura" />
            <Picker.Item label="RPG" value="RPG" />
            <Picker.Item label="Mundo Aberto" value="Mundo Aberto" />
            <Picker.Item label="Battle Royale" value="Battle Royale" />
            <Picker.Item label="MOBA" value="MOBA" />
            <Picker.Item label="FPS" value="FPS" />
            <Picker.Item label="Estratégia" value="Estratégia" />
            <Picker.Item label="Simulação" value="Simulação" />
            <Picker.Item label="Corrida" value="Corrida" />
            <Picker.Item label="Esportes" value="Esportes" />
            <Picker.Item label="Luta" value="Luta" />
            <Picker.Item label="Survival Horror" value="Survival Horror" />
            <Picker.Item label="Puzzle" value="Puzzle" />
            <Picker.Item label="Stealth" value="Stealth" />
            <Picker.Item label="Sandbox" value="Sandbox" />
            <Picker.Item label="MMORPG" value="MMORPG" />
            <Picker.Item label="Tower Defense" value="Tower Defense" />
            <Picker.Item label="Roguelike" value="Roguelike" />
            <Picker.Item label="Hack and Slash" value="Hack and Slash" />
            <Picker.Item label="Card Game" value="Card Game" />
            <Picker.Item label="Idle" value="Idle" />
            <Picker.Item label="Metroidvania" value="Metroidvania" />
            <Picker.Item label="RTS (Estratégia em Tempo Real)" value="RTS" />
            <Picker.Item label="Turn-based Strategy" value="Turn-based Strategy" />
            <Picker.Item label="Visual Novel" value="Visual Novel" />
            <Picker.Item label="Party Game" value="Party Game" />
            <Picker.Item label="Music/Rhythm" value="Music/Rhythm" />
            <Picker.Item label="Shoot 'em up" value="Shoot 'em up" />
            <Picker.Item label="Plataforma" value="Plataforma" />
            <Picker.Item label="VR/AR" value="VR/AR" />
          </Picker>
        </View>

        <TouchableOpacity onPress={handleGallery} style={styles.imageContainer}>
          {gameImage ? (
            <>
              <Image
                source={{ uri: gameImage }}
                style={styles.gameImage}
                onError={() => console.error('Erro ao carregar imagem do jogo')}
              />
              <Text style={styles.textImage}>Clique para trocar a imagem</Text>
            </>
          ) : (
            <>
              <Feather name="image" size={20} color="#8A8A8A" />
              <Text style={styles.textImage}>Imagem do jogo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleProgress} style={styles.enterButton}>
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1B1E',
    alignItems: 'center',
  },
  formContainer: {
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    gap: 8,
    marginTop: 30,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 150,
  },
  textArea: {
    backgroundColor: '#2D2D2D',
    borderColor: '#D4E5FF',
    borderWidth: 0.5,
    width: '100%',
    height: 100,
    borderRadius: 10,
    paddingLeft: 18,
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 5,
  },
  descriptionInput: {
    color: '#A5A5A5',
    width: '95%',
  },
  input: {
    backgroundColor: '#2D2D2D',
    borderColor: '#D4E5FF',
    borderWidth: 0.5,
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingLeft: 18,
    paddingRight: 18,
    color: '#A5A5A5',
  },
  header: {},
  main: {},
  imageContainer: {
    backgroundColor: '#2B2B2C',
    height: 80,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    gap: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  picker: {
    color: '#8A8A8A',
    left: -10,
  },
  pickerContainer: {
    backgroundColor: '#2D2D2D',
    borderColor: '#D4E5FF',
    borderWidth: 0.5,
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  textImage: {
    color: '#8A8A8A',
  },
  enterButton: {
    backgroundColor: '#5312C2',
    height: 45,
    alignSelf: 'stretch',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },

  gameImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
});

export default GameRegister;
