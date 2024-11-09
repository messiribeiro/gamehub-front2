/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import {MaterialIcons} from '@expo/vector-icons';
import { StatusBar } from 'react-native';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';

import { RootStackParamList } from '../navigation';

const { height } = Dimensions.get('window');

// Tipos de dados
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

interface User {
  id: number;
  username: string;
  profilePictureUrl: string;
  GameUser: GameUser[];
  Subscription: {
    type: string,
    isActive: boolean,
  }
}

interface InterestUser {
  id: number;
  username: string;
  profilePictureUrl: string;
  GameUser: GameUser[];
  Subscription: {
    type: string,
    isActive: boolean,
  }
}

type Props = StackScreenProps<RootStackParamList, 'FindGamer'>;

const FindGamer = ({ navigation, route }: Props) => {
  const { gameId } = route.params;
  const [interestUsers, setInterestUsers] = useState<InterestUser[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noUsersMessage, setNoUsersMessage] = useState<string | null>(null); // Estado para mensagem

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
      console.log('userId após a atualização:', id);
    };
    getUserId();
  }, []);

  // Função para buscar usuários interessados em um jogo
  const fetchInterestUsers = async (gameId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`api/user-game-interests/game/${gameId}`);
      const users = response.data.interestedUsers;
      console.log(users);

      console.log('userId usado no filtro:', Number(userId));
      const filteredUsers = users.filter((user: InterestUser) => user.id !== Number(userId));
      console.log(filteredUsers);

      setInterestUsers(filteredUsers);

      // Verifica se não há usuários filtrados
      if (filteredUsers.length === 0) {
        setNoUsersMessage('Nenhum usuário encontrado que joga este jogo.'); // Mensagem de ausência
      } else {
        setNoUsersMessage(null); // Reseta a mensagem se houver usuários
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

  const defaultImageUrl =
    'https://www.shutterstock.com/image-vector/profile-default-avatar-icon-user-600nw-2463844171.jpg';

    const renderUser: ListRenderItem<User> = ({ item }) => {
      const profileImageUrl =
        item.profilePictureUrl === 'https://example.com/profile-picture.jpg'
          ? defaultImageUrl
          : item.profilePictureUrl;
    
      return (
        <View style={styles.gamerData}>
          <StatusBar barStyle="dark-content" backgroundColor="#121212" />
    
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile', { profileUserId: String(item.id) })} style={styles.main} >
            <Image source={{ uri: profileImageUrl }} style={styles.userImage} />
    
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{item.username}</Text>
              {item.Subscription?.isActive && (
                <MaterialIcons name="verified" size={16} color="#FFC000" style={styles.verifiedIcon} />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.bio}>
            <Text style={styles.gamesText}>Jogos</Text>
            <FlatList
              data={item.GameUser}
              horizontal
              renderItem={({ item: gameUser }) => (
                <Image
                  key={gameUser.gameId}
                  source={{ uri: gameUser.game.gameimageUrl }}
                  style={styles.gameImage}
                />
              )}
              keyExtractor={(gameUser) => gameUser.game.id.toString()}
              showsHorizontalScrollIndicator={false}
              style={styles.games}
            />
          </View>
          <TouchableOpacity
            style={styles.invite}
            onPress={() => {
              navigation.navigate('ChatWindow', { receiverId: item.id, receiverName: item.username });
            }}>
            <Text style={styles.inviteText}>Convidar</Text>
          </TouchableOpacity>
        </View>
      );
    };
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
          <FlatList
            data={interestUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id.toString()}
            initialScrollIndex={interestUsers.length > 0 ? currentUserIndex : 0}
            getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(event.nativeEvent.contentOffset.y / height);
              setCurrentUserIndex(index);
            }}
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            snapToAlignment="start"
            decelerationRate="fast"
            style={{ flex: 1 }}
            onScroll={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const newIndex = Math.round(offsetY / height);
              // Mover para o índice mais próximo
              if (currentUserIndex !== newIndex) {
                setCurrentUserIndex(newIndex);
              }
            }}
          />
        )}
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: '10%',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  gamerData: {
    width: '100%',
    height,
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
  bio: {
    backgroundColor: '#2B2B2C',
    width: '80%',
    height: 150,
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
    width: 130,
    height: 40,
    backgroundColor: '#5312C2',
    borderRadius: 10,
    marginTop: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteText: {
    color: 'white',
  },
  games: {
    flexDirection: 'row',
    marginTop: 5,
    paddingVertical: 5, // Adicione um pouco de preenchimento se necessário

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
  }
});

export default FindGamer;
