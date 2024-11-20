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

type Props = StackScreenProps<RootStackParamList, 'Support'>;


const Support = ({ navigation }: Props) => {
  return (
    
    <View style={styles.container} >
      <StatusBar  backgroundColor="#1B1B1E" />
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apoie</Text>
      </View>

      <View style={styles.gameInfo}>
          <Text style={styles.gameName}>Grand Theft Auto VI</Text>
          <View style={styles.gameData}>
            <Image
              source={{ uri: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5cd1f6af-ed85-437b-ba2a-131693b7f3d8/dgj3kny-2ee3a0e9-ee94-4add-b61b-7d99f2858614.png/v1/fill/w_1280,h_1280,q_80,strp/gta_6_logo__4k__by_giga_bitten_dgj3kny-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcLzVjZDFmNmFmLWVkODUtNDM3Yi1iYTJhLTEzMTY5M2I3ZjNkOFwvZGdqM2tueS0yZWUzYTBlOS1lZTk0LTRhZGQtYjYxYi03ZDk5ZjI4NTg2MTQucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.2lLFlLqUI0F3Efblkgpp2kzZFgVwuMphRh8VyWy6d5A" }}
              style={styles.gameImage}
            />
            <View style={styles.data}>
              <View>
                <Text style={styles.text} >Jogo de mundo aberto</Text>
                <Text style={styles.text}>Desenvolvedor: droffyzin</Text>
              </View>
              

              <Text style={styles.publicationDate}>Publicado em 30 de outubro de 2024</Text>

            </View>
          </View>
        <Text style={styles.supportInfoText} >Apoie Grand Theft Auto e receba recompensas dentro do jogo</Text>

      </View>

      <View style={styles.main}> 
        <Text style={styles.text}>Você já contribuiu com 100 reais 🔥</Text>
        <View style={styles.progressBar}/>

        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsContainerTitle}>Recompensas</Text>
          <View style={styles.reward}>
            <Text style={styles.rewardDescription}>Acesso à versão beta do jogo</Text>
            <View style={styles.priceAndStatus} >
              <Text style={styles.rewardPrice} >R$ 100,00</Text>
              <Text style={styles.rewardStatus} >Desbloqueado</Text>
            </View>
          </View>

          <View style={styles.rewardLocked}>
            <Text style={styles.rewardDescription}>Receber a skin do bolsonaro</Text>
            <View style={styles.priceAndStatus} >
              <Text style={styles.rewardPrice} >R$ 150,00</Text>
              <Text style={styles.rewardStatus} >Bloqueado</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} >Apoiar</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
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
  progressBar: {
    marginTop: 10,
    backgroundColor: "#FAFF73",
    width: 100,
    height: 4,
  },
  rewardsContainer: {
    marginTop: 30,
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

export default Support;
