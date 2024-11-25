import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator, 
} from 'react-native';
import api from '../../services/api'; 

import { RootStackParamList } from '../../navigation';
import { FlatList } from 'react-native-gesture-handler';

type Props = StackScreenProps<RootStackParamList, 'Donate'>;


const Donate = ({ navigation, route }: Props) => {
  const gameId = 241;
  
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<{ name: string; gameimageUrl: string; category: string } | null>(null);

  // Fetch rewards
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewardsResponse = await api.get(`/api/donation/benefits/${gameId}`);
        setRewards(rewardsResponse.data);
      } catch (error) {
        console.error('Erro ao buscar recompensas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  // Fetch total donations
  useEffect(() => {
    const fetchTotalDonations = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
      try {
        const response = await api.get(`/api/donation/user/${id}/game/${gameId}/total-donations`);
        setTotalDonated(response.data.totalDonated);
      } catch (error) {
        console.error('Erro ao buscar total de doações:', error);
        setTotalDonated(0); // Valor padrão em caso de erro
      }
    };

    fetchTotalDonations();
  }, [userId, gameId]);

  // Fetch game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await api.get(`/api/games/${gameId}`);
        setGameData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do jogo:', error);
      }
    };

    fetchGameData();
  }, [gameId]);

  const calculateProgress = () => {
    if (rewards.length === 0) return 0;
  
    const totalThreshold = rewards.reduce((sum, reward) => sum + reward.threshold, 0);
    const progress = (totalDonated / totalThreshold) * 100;
  
    // Garantir que o valor esteja entre 0 e 100
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B1B1E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apoie</Text>
      </View>

      <View style={styles.gameInfo}>
        {gameData ? (
          <>
            <Text style={styles.gameName}>{gameData.name}</Text>
            <View style={styles.gameData}>
              <Image
                source={{ uri: gameData.gameimageUrl }}
                style={styles.gameImage}
              />
              <View style={styles.data}>
                <Text style={styles.text}>Categoria: {gameData.category}</Text>
                <Text style={styles.publicationDate}>Publicado em 30 de outubro de 2024</Text>
              </View>
            </View>
            <Text style={styles.supportInfoText}>
              Apoie {gameData.name} e receba recompensas dentro do jogo
            </Text>
          </>
        ) : (
          <ActivityIndicator size="large" color="#FAFF73" />
        )}
      </View>

      <View style={styles.main}>
        <Text style={styles.text}>
          Você já contribuiu com{' '}
          {totalDonated !== null ? `${totalDonated} reais` : 'carregando...'}
        </Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${calculateProgress()}%` }, // Largura baseada na porcentagem
            ]}
          />
        </View>

        <ScrollView style={styles.rewardsContainer}>
          <Text style={styles.rewardsContainerTitle}>Recompensas</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FAFF73" />
          ) : rewards.length > 0 ? (
            rewards.map((reward) => (
              <View
                key={reward.id}
                style={reward.threshold <= totalDonated ? styles.reward : styles.rewardLocked}
              >
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                <View style={styles.priceAndStatus}>
                  <Text style={styles.rewardPrice}>R$ {reward.threshold.toFixed(2)}</Text>
                  <Text style={styles.rewardStatus}>
                    {reward.threshold <= totalDonated ? 'Desbloqueado' : 'Bloqueado'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.text}>
              Ainda não há recompensas. Adicione para incentivar seus apoiadores.
            </Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Apoiar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    paddingTop: '3%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    zIndex: 10
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
  gameName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600"
  },
  gameInfo: {
    backgroundColor: "#2B2B2C",
    position: "absolute",
    width: "100%",
    zIndex: 0,
    paddingTop: "15%",
    paddingHorizontal: "13%",
    paddingBottom: "10%",
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    height: "32%"
  },
  gameData: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 10
  },
  data: {
    justifyContent: "space-between"
  },
  text: {
    color: "white",
    fontSize: 12,
  },
  publicationDate: {
    fontSize: 15,
    width: "70%",
    color: "white",
    fontWeight: "100"
  },
  supportInfoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "300",
    marginTop: 20
  },
  main: {
    marginTop: "50%",
    paddingHorizontal: "5%"
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden", // Para manter a barra dentro dos limites
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FAFF73",
    borderRadius: 4,
  },

  rewardsContainer: {
    marginTop: 30,
    height: "68%"
  },
  reward: {
    backgroundColor: "#2F4B2D",
    borderRadius: 10,
    gap: 10,
    padding: 10,
    marginBottom: 10,
  },

  rewardLocked: {
    backgroundColor: "#2B2B2C",
    borderRadius: 10,
    gap: 10,
    padding: 10,
    marginBottom: 10,
  },
  rewardDescription: {
    color: "white",
    fontSize: 15,
    
  },
  priceAndStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  rewardPrice: {
    color: "white",
    fontWeight: "700"
  },
  rewardStatus: {
    color: "white",
    fontSize: 10,
  },
  rewardsContainerTitle: {
    color: "white",
    marginBottom: 14,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
  },
  button: {
    backgroundColor: "#5312C2",
    width: "90%",
    height: 45,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});

export default Donate;
