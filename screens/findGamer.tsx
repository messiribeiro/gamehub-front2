import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar, FlatList, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import api from '../services/api';
import { RootStackParamList } from '../navigation';

interface Game {
  id: number;
  name: string;
  gameimageUrl: string;
  description: string | null;
}

interface GameUser {
  gameId: number;
  userId: number;
  game: Game;
}

interface InterestUser {
  id: number;
  username: string;
  profilePictureUrl: string;
  GameUser: GameUser[];
  Subscription: {
    type: string;
    isActive: boolean;
  };
}

type Props = StackScreenProps<RootStackParamList, 'FindGamer'>;

const FindGamer = ({ navigation, route }: Props) => {
  const { gameId } = route.params;
  const [interestUsers, setInterestUsers] = useState<InterestUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noUsersMessage, setNoUsersMessage] = useState<string | null>(null);
  const [sessionGameImage, setSessionGameImage] = useState<string | undefined>(undefined);
  const [fadeAnim] = useState(new Animated.Value(1)); // Inicializa o valor da animação de fade
  const [topAnim] = useState(new Animated.Value(10));
  const defaultImageUrl =
    'https://www.shutterstock.com/image-vector/profile-default-avatar-icon-user-600nw-2463844171.jpg';

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  const fetchInterestUsers = async (gameId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`api/user-game-interests/game/${gameId}`);
      const users = response.data.interestedUsers;
      const gameImage = response.data.gameImageUrl;
      setSessionGameImage(gameImage);

      // Remove o usuário logado da lista
      const filteredUsers = users.filter((user: InterestUser) => user.id !== Number(userId));

      if (filteredUsers.length === 0) {
        setNoUsersMessage('Nenhum usuário encontrado que joga este jogo.');
      } else {
        setNoUsersMessage(null);
        setInterestUsers(filteredUsers); // Substitui a lista inteira de usuários
      }
    } catch (error) {
      console.error('Erro ao buscar dados de interesse:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameId && userId) {
      fetchInterestUsers(gameId);
    }
  }, [gameId, userId]);

  const handleNextUser = () => {
    // Use the same driver for both animations (native driver)
    Animated.timing(fadeAnim, {
      toValue: 0.2, // Reduce opacity
      duration: 100,
      useNativeDriver: true, // Native driver
    }).start(() => {
      // Animate translateY (vertical position)
      Animated.timing(topAnim, {
        toValue: 20, // Move down
        duration: 50,
        useNativeDriver: true, // Native driver
      }).start(() => {
        // Update the user index after the animation is completed
        setCurrentIndex((prevIndex) => (prevIndex < interestUsers.length - 1 ? prevIndex + 1 : 0));
  
        // After updating the index, animate back to the top and restore opacity
        Animated.timing(topAnim, {
          toValue: 0, // Move back to the original position
          duration: 50,
          useNativeDriver: true, // Native driver
        }).start();
  
        Animated.timing(fadeAnim, {
          toValue: 1, // Restore opacity
          duration: 50,
          useNativeDriver: true, // Native driver
        }).start();
      });
    });
  };

  const renderUserGames = ({ item }: { item: GameUser }) => (
    <Image source={{ uri: item.game.gameimageUrl || defaultImageUrl }} style={styles.gameImage} />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#5312C2" />
        </View>
      ) : noUsersMessage ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.noUsersText}>{noUsersMessage}</Text>
        </View>
      ) : (
        interestUsers.length > 0 && (
          <View style={styles.gamerData}>
            <StatusBar barStyle="dark-content" backgroundColor="#121212" />
            <Animated.View
                style={[
                  styles.user,
                  {
                    opacity: fadeAnim, // Aplica animação de opacidade
                    transform: [{ translateY: topAnim }], // Usa translateY em vez de top
                  },
                ]}
              >

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Profile', { profileUserId: String(interestUsers[currentIndex].id) })
                }
                style={styles.main}
              >
                <Image
                  source={{
                    uri:
                      interestUsers[currentIndex].profilePictureUrl === 'https://example.com/profile-picture.jpg'
                        ? defaultImageUrl
                        : interestUsers[currentIndex].profilePictureUrl,
                  }}
                  style={styles.userImage}
                />
                <View style={styles.usernameContainer}>
                  <Text style={styles.username}>{interestUsers[currentIndex].username}</Text>
                  {interestUsers[currentIndex].Subscription?.isActive && (
                    <MaterialIcons name="verified" size={16} color="#FFC000" style={styles.verifiedIcon} />
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.userInformations}>
                <View style={styles.statusAndFollow}>
                  <View style={styles.status}>
                    <View style={styles.circle} />
                    <Text style={styles.statusText}>online agora</Text>
                  </View>
                  <Text style={styles.followText}>Seguir</Text>
                </View>

                <View style={styles.bio}>
                  <Text style={styles.bioText}>Procuro alguém pra jogar estou entrando em depressão</Text>
                </View>

                <View style={styles.sessionGame}>
                  <View style={styles.sessionGameImageContainer}>
                    <Image
                      source={{
                        uri: sessionGameImage || defaultImageUrl,
                      }}
                      style={styles.sessionGameImage}
                    />
                  </View>
                  <View style={styles.gameDetails}>
                    <View style={styles.gameStyle}>
                      <Text style={styles.gameStyleText}>Estilo de jogo</Text>
                      <View style={styles.circle2} />
                      <Text style={styles.gameStyleText}>Competitivo</Text>
                    </View>
                    <Text style={styles.gameBioText}>
                      Jogo Fortnite há 3 anos e busco alguém pra jogar campeonato, sou fragger
                    </Text>
                  </View>
                </View>

                <View style={styles.userGames}>
                  <Text style={styles.gamesTitle}>Outros jogos de @{interestUsers[currentIndex].username}</Text>
                  <FlatList
                    data={interestUsers[currentIndex].GameUser}
                    renderItem={renderUserGames}
                    keyExtractor={(item) => (item.gameId ? item.gameId.toString() : Math.random().toString())}
                    horizontal
                    style={styles.flatList}
                  />
                </View>

                <TouchableOpacity
                  style={styles.invite}
                  onPress={() =>
                    navigation.navigate('ChatWindow', {
                      receiverId: interestUsers[currentIndex].id,
                      receiverName: interestUsers[currentIndex].username,
                    })
                  }
                >
                  <Text style={styles.inviteText}>Convidar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <TouchableOpacity style={styles.findAnotherButton} onPress={handleNextUser}>
              <FontAwesome5 name="dice" size={20} color="#FFF" />
              <Text style={styles.findAnotherButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: '10%',
    justifyContent: "center"
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamerData: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: -50,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  username: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  userInformations: {
    backgroundColor: '#2B2B2C',
    width: "80%",
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
  },
  gamesText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  invite: {
    height: 40,
    backgroundColor: '#10C700',
    borderRadius: 10,
    marginTop: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteText: {
    color: 'white',
    fontWeight: "700"
  },
  games: {
    flexDirection: 'row',
    marginTop: 5,
    paddingVertical: 5,

  },
  gameImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,

  },
  noUsersText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  verifiedIcon: {
    top: 2,
  },

  main: {
    alignItems: "center"
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  circle: {
    width: 10,
    height: 10,
    backgroundColor: '#36C929',
    borderRadius: 50,
    top: 1,
  },
  circle2: {
    width: 5,
    height: 5,
    backgroundColor: '#FFF',
    borderRadius: 50,
    top: 1,
  },
  statusText: {
    color: 'white',
  },
  statusAndFollow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  text: {
    color: "white"
  },
  bio: {
    marginTop: 10
  },
  bioText: {
    color: "white",
    fontSize: 13
  },
  sessionGame: {
    marginTop: 15,
    flexDirection: "row",
    width: "100%",
  },
  sessionGameImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 10,
  },
  sessionGameImageContainer: {
    width: "36%",
  },
  user: {
    top: "10%"
  },
  gameDetails: {
    alignItems: "center",
    width: "74%",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  gameStyle: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 5
  },
  gameBioText: {
    width: "100%",
    color: "white"
  },
  gameStyleText: {
    fontWeight: "bold",
    color: "white"
  },
  userGames: {
    marginTop: 20,
  },
  gamesTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "500"
  },
  followText: {
    color: "white",
    fontWeight: "600"
  },
  findAnotherButton: {
    backgroundColor: "#701EFF",
    width: "87%",
    borderRadius: 50,
    height: 45,
    marginTop: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row"
  },
  findAnotherButtonText: {
    color: "white",
    fontWeight: "bold"
  },
  flatList: {
    maxHeight: 40,
    marginTop: 10,
  }

});

export default FindGamer;
