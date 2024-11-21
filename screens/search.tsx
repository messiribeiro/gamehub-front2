import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';

import { RootStackParamList } from '../navigation';
import { TextInput } from 'react-native-gesture-handler';

type Props = StackScreenProps<RootStackParamList, 'Search'>;

const Search = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B1B1E"/>
      <View style={styles.searchContainer}>
      <TextInput
              style={styles.input}
              placeholder="Buscar por um usuário ou um jogo"
              placeholderTextColor="#888"
              
      />
      <Feather name='search' color={"#fff"} size={20} />
      </View>
      <View style={styles.resultContainer}>
        <View style={styles.profile}>
        <Image
            source={{ uri: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTBJnbAfG4yN2F2J8eHyvzLbbdHahekyrf3PhMCteMxxywyHVJF"}}
            style={styles.profileImage}
            onError={() => console.error('Erro ao carregar imagem do jogo')}
          />
          <Text style={styles.profileName} >dog</Text>
        </View>
      </View>
    </View>
      
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    paddingTop: '3%',
    alignItems: "center"
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    width: "90%",
    height: 40,
    paddingHorizontal: 15
  },
  currencySymbol: {
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 30

  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 50
  },
  profileName: {
    color: "white",
    fontSize: 16,
  }
  
});

export default Search;
