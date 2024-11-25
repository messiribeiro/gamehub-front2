/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { RootStackParamList } from "../navigation";
import api from "../services/api";

// Definindo o tipo das props
type Props = StackScreenProps<RootStackParamList, "AddGames">;

const AddGame: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [games, setGames] = useState<any[]>([]); // Lista de jogos da API

  // Buscar jogos da API ao carregar a tela
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get(`/api/games/not-in-profile/${userId}`);
        setGames(response.data); // Atualiza a lista de jogos
      } catch (error) {
        console.error("Erro ao buscar jogos: ", error);
        Alert.alert("Erro", "Não foi possível carregar os jogos.");
      }
    };

    fetchGames();
  }, []);

  // Filtrar jogos com base na barra de busca
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Alternar seleção de jogos
  const toggleSelectGame = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter((id) => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  // Salvar jogos selecionados no servidor
  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const response = await api.post(`/api/games/profile/add`, {
        gameId: selectedGames,
        userId: userId,
      });

      if (response.status === 201) {
        Alert.alert("Sucesso", "Jogos adicionados com sucesso!");
        navigation.goBack(); // Retorna à tela anterior
      } else {
        Alert.alert("Erro", "Algo deu errado.");
      }
    } catch (error) {
      console.error("Erro ao salvar jogos:", error);
      Alert.alert("Erro", "Não foi possível salvar os jogos.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Jogos</Text>
        </View>

      {/* Barra de busca */}
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

      {/* Lista de jogos */}
      <FlatList
        data={filteredGames}
        contentContainerStyle={styles.flatListContent}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.gameIconContainer,
              selectedGames.includes(item.id) &&
                styles.selectedGameIconContainer,
            ]}
            onPress={() => toggleSelectGame(item.id)}
          >
            <Image
              source={{ uri: item.gameimageUrl }}
              style={styles.gameIcon}
            />
          </TouchableOpacity>
        )}
        style={styles.gameList}
      />

      {/* Botão para salvar */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 20
  },

   header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  backButton: {
    position: "absolute",
    left:"-32%",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#363636",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: "90%",
  },

  flatListContent: {
  },
  searchBar: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: 40,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  gameList: {
    flexGrow: 0,
  },
  gameIconContainer: {
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  selectedGameIconContainer: {
    borderWidth: 2,
    borderColor: "#512DA8",
    borderRadius: 5,
    padding: 2,
  },
  gameIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#512DA8",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddGame;
