/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import {Feather} from "@expo/vector-icons";
import { StatusBar } from 'react-native';

import { RootStackParamList } from '../navigation';
import api from '../services/api';

// Definindo o tipo das props
type Props = StackScreenProps<RootStackParamList, 'GameSelect'>;

const GameSelect = ({ navigation }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [games, setGames] = useState<any[]>([]); // Inicializando a lista de jogos como um array vazio

  // Carregar jogos da API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/api/games'); 
        setGames(response.data); 
      } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os jogos.');
      }
    };

    fetchGames();
  }, []);

  // Filtra os jogos com base na busca
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Alterna a seleção de jogos
  const toggleSelectGame = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter(id => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  const handleSave = async () => {
    try {
      const username = await AsyncStorage.getItem("username");
      const email = await AsyncStorage.getItem("email");
      const password = await AsyncStorage.getItem("password");
  
      const response = await api.post('/api/auth/signup', {
        username,
        email,
        password,
        profilePicture: 'https://media.istockphoto.com/id/1185655985/vector/gamer-portrait-video-games-background-glitch-style-player-vector-illustration-online-user.jpg?s=612x612&w=0&k=20&c=uoy0NDqomF2RzJdrNFQM25WwVahjRggjDHYhQoNnx3M=',
        games: selectedGames,
      });


      if (response.status === 201) {
        const newUserId = response.data.data.id; 
        
        await AsyncStorage.removeItem("username")
        await AsyncStorage.removeItem("email")
        await AsyncStorage.removeItem("password")

        await AsyncStorage.setItem("userId", String(newUserId));
        navigation.navigate('Home');
      } else {
        Alert.alert('vish 😥 ', 'Algo deu errado');

      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('vish 😥 ', 'Algo deu errado');
    }
  };

  return (
    <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <Text style={styles.title}>Quais jogos você joga?</Text>

      <View style={styles.gamesSection}>
        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={24} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Pesquisar"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.gameIconContainer,
                selectedGames.includes(item.id) && styles.selectedGameIconContainer
              ]}
              onPress={() => toggleSelectGame(item.id)}
            >
              <Image source={{ uri: item.gameimageUrl }} style={styles.gameIcon} />
            </TouchableOpacity>
          )}
          style={styles.gameList}
        />
      </View>

      {/* Botão para salvar jogos selecionados */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
      >
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
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  searchBar: {
    width: '100%',
    height: 20,
    paddingHorizontal: 15,
    color: '#fff',
    flex: 1,
    fontSize: 16,
  },
  gamesSection: {
    width: "70%",
    height: 300,
    backgroundColor: "#363636",
    display: "flex",
    alignItems: "center",
    borderRadius: 5,
  },
  gameList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  gameIconContainer: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 85, // Defina uma largura fixa
    height: 85, // Defina uma altura fixa
    borderRadius: 5,
  },
  selectedGameIconContainer: {
    borderWidth: 2,
    borderColor: '#512DA8',
    borderRadius: 5,
    padding: 2,
  },
  gameIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#512DA8',
    padding: 15,
    borderRadius: 10,
    width: '70%',
    height: 50,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    borderRadius: 5,
    paddingLeft: 15,
    paddingTop: 15,
    marginBottom: 10
  },
  icon: {
    marginRight: 0,
  },
});

export default GameSelect;
