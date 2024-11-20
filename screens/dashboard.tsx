import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

import { RootStackParamList } from '../navigation';
import { StatusBar } from 'react-native';

interface Game {
  id: number;
  name: string;
  description: string;
  category: string;
  gameimageUrl: string | null;
}

type Props = StackScreenProps<RootStackParamList, 'Dashboard'>;

const Dashboard = ({ navigation, route }: Props) => {
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { from } = route.params || {}; // Desestrutura o parâmetro 'from'

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
          await fetchUserGames(id);
        } else {
          console.error('Erro: userId não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao carregar userId do AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserId();
  }, []);

  useEffect(() => {
    if (from === 'GamePreview') {
      refreshGames(); // Recarrega os jogos se vier de GamePreview
    }
  }, [from]);

  const fetchUserGames = async (id: string) => {
    try {
      const response = await api.get(`/api/games/user/${id}`);
      setUserGames(response.data);
    } catch (error) {
      console.error('Erro ao buscar jogos do usuário:', error);
    }
  };

  const refreshGames = async () => {
    setLoading(true);
    if (userId) {
      await fetchUserGames(userId);
    }
    setLoading(false);
  };

  const handleGameregister = () => {
    navigation.navigate('GameRegister', { imageUri: null });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchUserGames(userId);
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {userGames.length > 0 && (
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Seus jogos</Text>
          <TouchableOpacity onPress={handleGameregister}>
            <Feather name="plus-square" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {userGames.length > 0 ? (
        <FlatList
          data={userGames.slice().reverse()}
          style={styles.flatList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.gameCard}>
              <Image
                source={{ uri: item.gameimageUrl || 'https://via.placeholder.com/100' }}
                style={styles.gameImage}
              />
              <View style={styles.gameDetails}>
                <Text style={styles.gameName}>{item.name}</Text>
                <Text style={styles.gameCategory}>{item.category}</Text>
                <Text style={styles.gameDescription} numberOfLines={2} ellipsizeMode="tail">
                  {item.description}
                </Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        />
      ) : (
        <View style={styles.noGamesContainer}>
          <Text style={styles.noGamesText}>Você ainda não adicionou nenhum jogo à plataforma</Text>
          <TouchableOpacity onPress={handleGameregister} style={styles.addButton}>
            <Text style={styles.addButtonText}>Adicionar jogo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
    paddingTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  flatList: {},
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameCard: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    marginBottom: 16,
  },
  gameImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  gameDetails: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  gameCategory: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 6,
  },
  gameDescription: {
    color: '#ddd',
    fontSize: 14,
  },
  noGamesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGamesText: {
    color: '#fff',
    marginBottom: 16,
  },
  addButton: {
    padding: 10,
    backgroundColor: '#6a0dad',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
  },
});

export default Dashboard;
