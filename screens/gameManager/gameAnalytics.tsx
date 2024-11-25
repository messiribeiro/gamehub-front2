import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState, useCallback } from 'react';
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

type Props = StackScreenProps<RootStackParamList, 'GameAnalytics'>;
type Reward = {
  id: number;
  gameId: number;
  threshold: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const GameAnalytics = ({ navigation, route }: Props) => {
  const { gameId } = route.params;

  // Estado para armazenar os dados do jogo
  const [gameData, setGameData] = useState({
    id: "",
    name: "",
    gameimageUrl: "",
    category: "",
  });

  // Estado para armazenar o número de apoiadores e valor arrecadado
  const [supportersCount, setSupportersCount] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);


  useFocusEffect(
    useCallback(() => {
      const fetchGameData = async () => {
        try {
          setLoading(true);
  
          // Buscar dados do jogo
          const response = await api.get(`/api/games/${gameId}`);
          setGameData(response.data);
  
          // Buscar número de apoiadores
          const supportersResponse = await api.get(`/api/donation/game/${gameId}/supporters-count`);
          setSupportersCount(supportersResponse.data.supportersCount);
  
          // Buscar valor arrecadado
          const donationsResponse = await api.get(`/api/donation/game/${gameId}/author/total-donations`);
          setTotalDonated(donationsResponse.data.totalDonated);
  
          // Buscar recompensas
          const rewardsResponse = await api.get(`/api/donation/benefits/${gameId}`);
          setRewards(rewardsResponse.data);
        } catch (error) {
          console.error("Erro ao buscar os dados:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchGameData();
    }, [gameId])
  );


  // Função para buscar os dados do jogo
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Buscar dados do jogo
        const response = await api.get(`https://gamehub-back-706779899193.us-central1.run.app/api/games/${gameId}`);
        setGameData(response.data);

        // Buscar número de apoiadores
        const supportersResponse = await api.get(`https://gamehub-back-706779899193.us-central1.run.app/api/donation/game/${gameId}/supporters-count`);
        setSupportersCount(supportersResponse.data.supportersCount);

        // Buscar valor arrecadado
        const donationsResponse = await api.get(`https://gamehub-back-706779899193.us-central1.run.app/api/donation/game/${gameId}/author/total-donations`);
        setTotalDonated(donationsResponse.data.totalDonated);
        const rewardsResponse = await api.get(`https://gamehub-back-706779899193.us-central1.run.app/api/donation/benefits/${gameId}`);
        setRewards(rewardsResponse.data);

      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B1B1E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dados do jogo</Text>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{gameData.name}</Text>
        <View style={styles.gameData}>
          <Image source={{ uri: gameData.gameimageUrl }} style={styles.gameImage} />
          <View style={styles.data}>
            <View>
              <Text style={styles.text}>Categoria: {gameData.category}</Text>
              <Text style={styles.text}>Desenvolvedor: droffyzin</Text>
            </View>
            <Text style={styles.publicationDate}>Publicado em 30 de outubro de 2024</Text>
          </View>
        </View>
        <Text style={styles.supportInfoText}>
          {gameData.name} é um jogo eletrônico da categoria {gameData.category}.
        </Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.messageText}>
          Parabéns! Você chegou à marca de {supportersCount} apoiadores nesse jogo 🎉
        </Text>
        <View style={styles.analyticsContainer}>
          <View style={styles.supporterCounter}>
            <Text style={styles.analyticsTitleText}>Apoiadores</Text>
            <Text style={styles.analyticsNumberText}>{supportersCount}</Text>
            <View style={styles.lastMonthText}>
              <Feather name="arrow-up" color={"#5FFF51"} size={15} />
              <Text style={styles.analyticsLastMonthText}>10 no último mês</Text>
            </View>
          </View>
          <View style={styles.amount}>
            <Text style={styles.analyticsTitleText}>Valor arrecadado</Text>
            <Text style={styles.analyticsNumberText}>R$ {totalDonated.toFixed(2)}</Text>
            <View style={styles.lastMonthText}>
              <Feather name="arrow-up" color={"#5FFF51"} size={15} />
              <Text style={styles.analyticsLastMonthText}>R$ {totalDonated.toFixed(2)} no último mês</Text>
            </View>
          </View>
        </View>

        <Text style={styles.rewardsContainerTitle}>Recompensas para seus apoiadores</Text>
        <ScrollView style={styles.rewardsContainer}>
  {rewards.length === 0 ? (
    <View style={styles.noRewardContainer}>
      <Text style={styles.noRewardText}>
        Ainda não há recompensas disponíveis. Adicione uma recompensa para incentivar seus apoiadores e tornar o seu jogo ainda mais atrativo!
      </Text>
    </View>
  ) : (
    rewards.map((reward) => (
      <View key={reward.id} style={styles.reward}>
        <Text style={styles.rewardDescription}>{reward.description}</Text>
        <View style={styles.priceAndStatus}>
          <Text style={styles.rewardPrice}>R$ {reward.threshold.toFixed(2)}</Text>
        </View>
      </View>
    ))
  )}
</ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("AddReward", { gameId: gameId })}>
          <Text style={styles.buttonText}>Adicionar recompensa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    height: "29%"
  },
  gameData: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,

  },
  gameImage: {
    width: 60,
    height: 60,
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
    fontSize: 10,
    width: "80%",
    color: "white",
    fontWeight: "300"
  },
  supportInfoText: {
    color: "white",
    fontSize: 12,
    fontWeight: "300",
    marginTop: 10
  },

  gameName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600"
  },
  main: {
    marginTop: "45%",
    paddingHorizontal: "5%"
  },
  messageText: {
    color: "white",
    fontSize: 16,
    width: 300
  },
  analyticsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  supporterCounter: {
    width: "49.5%",
    height: 110,
    backgroundColor: "#2B2B2C",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between"

  },
  amount: {
    width: "49.5%",
    height: 110,
    backgroundColor: "#2B2B2C",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between"
  },
  lastMonthText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  analyticsTitleText: {
    color: "white",
    fontSize: 18
  },
  analyticsNumberText: {
    color: "white",
    fontSize: 26
  },
  analyticsLastMonthText: {
    color: "#5FFF51",
    fontSize: 12,
  },
  rewardsContainer: {
    marginTop: 5,
    height: 260
  },
  reward: {
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
    marginTop: 30
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B1B1E",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
  noRewardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  noRewardText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '300',
  },

});

export default GameAnalytics;