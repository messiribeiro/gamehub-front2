import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import GoBackAlert from "../components/GoBackAlert"; // Importando o alerta

type Props = StackScreenProps<RootStackParamList, 'MyGames'>;

const MyGames = ({ navigation }: Props) => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false); // Estado para controlar a visibilidade do alerta

  const optionsAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(Number(storedUserId));
        }
      } catch (error) {
        console.error('Erro ao recuperar o userId do AsyncStorage:', error);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      const fetchUserGames = async () => {
        try {
          const response = await api.get(`/api/users/${userId}`);
          const userGames = response.data.GameUser;
          setGames(userGames);
          setLoading(false);
        } catch (error) {
          console.error('Erro ao buscar os jogos:', error);
          setLoading(false);
        }
      };

      fetchUserGames();
    }
  }, [userId]);

  const showOptions = (gameId: string) => {
    setSelectedGame(gameId);
    Animated.timing(optionsAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const hideOptions = () => {
    setSelectedGame(null);
    Animated.timing(optionsAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const optionsStyle = {
    opacity: optionsAnim,
    transform: [
      {
        translateY: optionsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight, 0],
        }),
      },
    ],
  };

  const handleTouchOutside = () => {
    if (selectedGame) {
      hideOptions();
    }
  };

  // Função para excluir o jogo
  const deleteGame = (gameId: string) => {
    console.log(`Excluindo o jogo com id ${gameId}`);
    // Adicione a lógica de exclusão de jogo aqui, como uma requisição API para deletar
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#1B1B1E" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTouchOutside}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#1B1B1E" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Jogos</Text>
        </View>

        <View style={styles.main}>
          <Text style={styles.mainTitle}>Jogos da sua lista</Text>

          {games.length === 0 ? (
            <View style={styles.noGamesContainer}>
              <Text style={styles.noGamesText}>Você ainda não adicionou nenhum jogo ao seu perfil</Text>
            </View>
          ) : (
            <View style={styles.games}>
              {games.map((game, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (selectedGame === game.game.id) {
                      hideOptions();
                    } else {
                      setSelectedGame(game.game.id);
                      hideOptions();
                    }
                  }}
                  onLongPress={() => {
                    showOptions(game.game.id);
                  }}
                  delayLongPress={200}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.game, selectedGame && selectedGame !== game.game.id && { opacity: 0.3 }]}
                  >
                    <Image
                      source={{ uri: game.game.gameimageUrl }}
                      style={styles.gameImage}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {!selectedGame && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.addButton}>
              <Feather name="plus" color="#FFF" size={25} />
            </TouchableOpacity>
          </View>
        )}

        {selectedGame && (
          <Animated.View style={[styles.options, optionsStyle]}>
            <TouchableOpacity>
              <Feather name="heart" size={26} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Feather name="plus-circle" size={26} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAlert(true)}>
              <Feather name="trash" size={26} color="#000000" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Modal de confirmação de exclusão */}
        <GoBackAlert
          visible={showAlert}
          onClose={() => setShowAlert(false)} // Fecha o alerta
          onConfirm={() => {
            deleteGame(selectedGame!); // Chama a função de deletar o jogo
            setShowAlert(false); // Fecha o alerta após confirmar
          }}
          title="Quer excluir esse jogo?"
          message="Ele será removido da sua lista."
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1B1E',
    paddingTop: '5%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
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
  main: {
    paddingHorizontal: 25,
  },
  mainTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  noGamesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGamesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  games: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    maxWidth: '100%',
  },
  game: {},
  gameImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 15,
  },
  addButton: {
    width: 60,
    height: 60,
    backgroundColor: '#5312C2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '75%',
  },
  options: {
    width: 160,
    height: 60,
    backgroundColor: '#D4E5FF',
    borderRadius: 20,
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
  },
});

export default MyGames;
