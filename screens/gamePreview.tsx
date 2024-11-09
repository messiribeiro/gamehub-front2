import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState, useRef } from 'react';
import axios from "axios"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import api from '../services/api';
import { StatusBar } from 'react-native';

import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'GamePreview'>;

const GamePreview = ({ navigation, route }: Props) => {
  const [gameName, setGameName] = useState<string | null>(null);
  const [gameDescription, setGameDescription] = useState<string | null>(null);
  const [gameCategory, setGameCategory] = useState<string | null>(null);
  const [gameImage, setGameImage] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current; // 0: small, 1: normal
  const opacityAnim = useRef(new Animated.Value(0)).current; // 0: transparent, 1: opaque

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedGameImage = await AsyncStorage.getItem('gameImage');
        const storedGameName = await AsyncStorage.getItem('gameName');
        const storedGameCategory = await AsyncStorage.getItem('gameCategory');
        const storedGameDescription = await AsyncStorage.getItem('gameDescription');

        setGameName(storedGameName);
        setGameCategory(storedGameCategory);
        setGameDescription(storedGameDescription);
        setGameImage(storedGameImage);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    setCurrentDate(date.toLocaleDateString('pt-BR', options));
  }, []);

  const handlePublish = async () => {
    if (!gameName || !gameDescription || !gameCategory || !gameImage) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    const formData = new FormData();

    // Adicione os dados do jogo ao FormData
    formData.append('name', gameName);
    formData.append('description', gameDescription);
    formData.append('category', gameCategory);

    // Verifica a extensão do arquivo
    const fileExtension = gameImage.split('.').pop()?.toLowerCase();
    let fileType = '';

    if (fileExtension === 'png') {
      fileType = 'image/png';
    } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      fileType = 'image/jpeg';
    } else {
      Alert.alert('Erro', 'Apenas arquivos PNG e JPG são aceitos.');
      return;
    }

    const file = {
      uri: gameImage,
      name: `arquivoDoUser${userId}.${fileExtension}`, // Inclui a extensão no nome do arquivo
      type: fileType,
    };
    console.log(file);
    formData.append('file', file as any);

    try {
      const response = await api.post(`/api/games/add/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
      if (response.status === 201) {
        // Limpar AsyncStorage após a criação do jogo
        await AsyncStorage.removeItem('gameImage');
        await AsyncStorage.removeItem('gameName');
        await AsyncStorage.removeItem('gameCategory');
        await AsyncStorage.removeItem('gameDescription');
    
        navigation.navigate('Dashboard', {from: "GamePreview"});
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          Alert.alert('ah não ☹️', 'Você atingiu o limite de jogos para seu plano');
        } else {
          console.log(error.response)
          Alert.alert('ah não ☹️', 'Não conseguimos cadastrar seu jogo');
        }
      } else {
        console.error(error);
        Alert.alert('ah não ☹️', 'Não conseguimos cadastrar seu jogo');
      }
    } finally {
      closeModal(); // Fecha o modal após a tentativa de publicação
    }
    
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(() => setModalVisible(false));
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <View style={styles.header} />
      <View style={styles.gamePreview}>
        <Text style={styles.gameName}>{gameName}</Text>
        <View style={styles.imageAndData}>
          <Image
            source={gameImage ? { uri: gameImage } : require('../assets/defaultImage.jpg')}
            style={styles.gameImage}
            onError={() => console.error('Erro ao carregar imagem do jogo')}
          />
          <View style={styles.data}>
            <Text style={styles.category}>{gameCategory}</Text>
            <Text style={styles.text}>Publicado em {currentDate}</Text>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <ScrollView>
            <Text style={styles.gameDescription}>{gameDescription}</Text>
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={openModal}>
        <Text style={styles.textButton}>Publicar</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}>
            <Text style={styles.modalText}>Tem certeza que deseja publicar este jogo?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.publishButton]}
                onPress={handlePublish}>
                <Text style={styles.modalButtonText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1B1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameDescription: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
  },
  data: {},
  gameImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 0.3,
    borderColor: '#701EFF',
  },
  imageAndData: {
    flexDirection: 'row',
    gap: 10,
  },
  gameName: {
    color: 'white',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '700',
  },
  gamePreview: {
    width: '80%',
    backgroundColor: '#2B2B2C',
    borderRadius: 10,
    minHeight: 200,
    padding: 20,
  },
  header: {},
  text: {
    color: 'white',
    width: '80%',
  },
  category: {
    color: 'white',
    marginBottom: 10,
  },
  textButton: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    width: '80%',
    backgroundColor: '#5312C2',
    height: 50,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  descriptionContainer: {
    maxHeight: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#2B2B2C',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#707070',
  },
  publishButton: {
    backgroundColor: '#5312C2',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 15,
  },
});

export default GamePreview;
