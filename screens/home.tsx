import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContext } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import CommentSection from '../components/CommentSection';
import Header from '../components/Header';
import MenuModal from '../components/MenuModal';
import PostFeed from '../components/PostFeed';
import TabMenu from '../components/TabMenu';
import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'react-native';

import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  PanResponder,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

interface Game {
  id: number;
  name: string;
  gameimageUrl: string;
}

interface Post {
  id: number;
  content: string;
  imageUrl: string;
  authorId: number;
  createdAt: string;
}

const Home = ({ navigation }: Props) => {
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postLimit, setPostLimit] = useState(5);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef<TextInput | null>(null);
  const uniquePosts = [...new Map(posts.map((post) => [post.id, post])).values()];

  const [userData, setUserData] = useState<{
    profilePictureUrl: string;
    username: string;
    Subscription?: { isActive: boolean };
  } | null>(null);

  const [userStats, setUserStats] = useState<{
    followersCount: number;
    followingCount: number;
  } | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const previousRouteName = navigation.getState().routes[navigation.getState().index - 1]?.name;

  useEffect(() => {
    const newUser = navigation.addListener('focus', () => {
      if (previousRouteName === 'GameSelect') {
        fetchPosts(); // Recarregue os dados dos posts ou qualquer outra função que você queira chamar.
        fetchUserGames(); // Recarrega jogos do usuário
        fetchAllGames(); // Recarrega todos os jogos
        fetchUserStats(); // Recarrega as estatísticas do usuário
      }
    });
  
    return newUser; // Limpa o listener ao desmontar
  }, [navigation]);


  useEffect(() => {
    // Função para capturar o evento de voltar
    const backAction = () => {
      if (previousRouteName === 'GameSelect') {
        // Se a tela anterior for GameSelect, sair do aplicativo
        BackHandler.exitApp();
        return true; // Impede a navegação para a tela anterior
      }
      return false; // Permite a navegação normal
    };

    // Adiciona o listener para o evento de voltar
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Limpa o listener quando o componente for desmontado
    return () => backHandler.remove();
  }, [previousRouteName]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          setModalVisible(false);
        }
      },
    })
  ).current;

  const fetchPosts = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/api/post');
      const sortedPosts = response.data.reverse(); // Pega todos os posts
      setPosts(sortedPosts.slice(0, postLimit)); // Apenas os primeiros posts
      setHasMorePosts(response.data.length > postLimit);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      console.log(id)
      setUserId(id);
    };

    loadUserId();
  }, []);

  const fetchUserGames = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/users/${userId}`);
      setUserGames(response.data.GameUser.map((gameUser: any) => gameUser.game));
      setUserData(response.data);
    } catch (error) {
      console.error('Erro ao buscar jogos do usuário:', error);
    }
  };

  const fetchAllGames = async () => {
    try {
      const response = await api.get('/api/games');
      setAllGames(response.data);
    } catch (error) {
      console.error('Erro ao buscar todos os jogos:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const profileUserId = await AsyncStorage.getItem('userId');
      const statsResponse = await api.get(`api/friendships/stats/${profileUserId}`);
      setUserStats(statsResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        await fetchUserGames();
        await fetchAllGames();
        await fetchUserStats();
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Atualiza posts
      const response = await api.get('/api/post');
      const newPosts = response.data.reverse().slice(0, postLimit);
      setPosts(newPosts);
  
      // Atualiza jogos do usuário
      await fetchUserGames();
  
      // Atualiza todos os jogos
      await fetchAllGames();
  
      // Atualiza estatísticas do usuário
      await fetchUserStats();
  
      console.log(userData); // Confirma se o userData está atualizado
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const handleImagePress = (gameId: number) => {
    navigation.navigate('FindGamer', { gameId });
  };

  const loadMorePosts = async () => {
    if (hasMorePosts) {
      const response = await api.get('/api/post');
      const newPosts = response.data.reverse().slice(posts.length, posts.length + postLimit);
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setHasMorePosts(newPosts.length > 0);
    }
  };

  const combinedGames = [
    ...userGames,
    ...allGames.filter((game) => !userGames.some((userGame) => userGame.id === game.id)),
  ];

  const filteredGames = combinedGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchIconPress = () => {
    setIsSearchActive(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCommentButtonClick = (postId: number) => {
    setSelectedPostId(postId);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#121212" />

        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const openMenu = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  return (
    
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <MenuModal
        key={`menu-${refreshing}`} // Usando o estado 'refreshing' para gerar uma chave dinâmica
        navigation={navigation}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        userData={userData}
        userStats={userStats}
      />

      <FlatList
        data={uniquePosts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <PostFeed
            post={item}
            navigation={navigation}
            onCommentButtonClick={handleCommentButtonClick}
          />
        )}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Header navigation={navigation} onProfileImagePress={openMenu} />
            <View style={styles.searchContainer}>
              {isSearchActive ? (
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (text === '') {
                      setIsSearchActive(false);
                    }
                  }}
                  placeholder="Digite o nome do jogo"
                  placeholderTextColor="#aaa"
                  onBlur={() => {
                    if (searchQuery === '') {
                      setIsSearchActive(false);
                    }
                  }}
                  onFocus={() => setIsSearchActive(true)}
                  onSubmitEditing={() => {
                    console.log('Busca:', searchQuery);
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.searchBar} onPress={handleSearchIconPress}>
                  <Text style={styles.searchTitle}>O que você quer jogar hoje?</Text>
                  <Feather name="search" type="feather" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.games}>
              {filteredGames.length > 0 ? (
                <FlatList
                  horizontal
                  data={filteredGames}
                  keyExtractor={(item) => item.id.toString()}
                  refreshing={refreshing}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleImagePress(item.id)}
                      style={styles.imageContainer}>
                      <Image
                        source={{ uri: item.gameimageUrl }}
                        style={styles.image}
                        onError={() => console.error('Erro ao carregar imagem do jogo')}
                      />
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.noGamesText}>Nenhum jogo disponível no momento</Text>
              )}
            </View>
          </>
        }
      />
      <TabMenu navigation={navigation} />
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View {...panResponder.panHandlers} style={styles.modalContainer}>
            {selectedPostId !== null && (
              <CommentSection postId={selectedPostId} onClose={() => setModalVisible(false)} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingLeft: '3%',
    paddingRight: '3%',
  },
  searchTitle: {
    color: 'white',
    fontSize: 17,
  },
  games: {
    paddingLeft: '3%',
    paddingRight: '3%',
    marginBottom: 30,
    marginTop: 10,
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  noGamesText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 180,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  searchInput: {
    color: 'white',
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Home;
