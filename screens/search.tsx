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
import api from '@/services/api';

type Props = StackScreenProps<RootStackParamList, 'Search'>;

const Search = ({ navigation }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]); // Lista de usuários
  const [loading, setLoading] = useState(false); // Controle de carregamento
  const [error, setError] = useState(''); // Controle de erro
  const [userId, setUserId] = useState<string | null>(null);
  
  // Função para fazer a requisição ao backend
  const fetchUsers = async (query: string) => {
    setLoading(true);
    setError('');
    const id = await AsyncStorage.getItem("userId");
    console.log(userId)
    setUserId(id);
    try {
      const response = await api.get(`api/users/search/username?username=${query}&page=1&limit=10`);
      console.log(response.data); // Log to check the response structure
      
      // Acesse o array de usuários dentro de response.data.users
      const usersData = response.data.users;
  
      // Verifique se usersData é um array e se não está vazio
      if (Array.isArray(usersData) && usersData.length > 0) {
        setUsers(usersData); // Atualiza o estado com os usuários encontrados
      } else {
        setUsers([]); // Se não houver usuários, define como array vazio
        setError('Nenhum usuário encontrado.');
      }
    } catch (err) {
      setError('Erro ao carregar resultados.');
    } finally {
      setLoading(false);
    }
  };

  // Executar a busca quando o termo mudar
  useEffect(() => {
    if (searchQuery.length > 2) { // Só buscar se o termo tiver mais que 2 caracteres
      fetchUsers(searchQuery);
    } else {
      setUsers([]); // Se a busca estiver vazia, limpar os resultados
    }
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1B1B1E" />
      <View style={styles.header}>
        <Feather onPress={() => navigation.goBack()} style={styles.arrowLeft} name="arrow-left" size={24} color="#FFF" />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Buscar por um usuário ou um jogo"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery} // Atualiza o termo de busca
          />
          <Feather name="search" color="#fff" size={20} />
        </View>
      </View>

      {/* Se estiver carregando, exibe um texto de loading */}
      {loading && <Text style={styles.loadingText}>Carregando...</Text>}

      {/* Se houver erro, exibe a mensagem de erro */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Exibe os resultados da busca */}
      <View style={styles.resultContainer}>
  {users
    .filter((user) => user.id.toString() !== userId?.toString()) // Filtra o usuário logado
    .map((user) => (
      <TouchableOpacity
        key={user.id}
        style={styles.profile}
        onPress={() => {
          navigation.navigate('Profile', { profileUserId: user.id });
        }}
      >
        <Image
          source={{ uri: user.profilePictureUrl || 'default-image-url' }}
          style={styles.profileImage}
          onError={() => console.error('Erro ao carregar imagem do usuário')}
        />
        <Text style={styles.profileName}>{user.username}</Text>
      </TouchableOpacity>
    ))}
</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingTop: '3%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  arrowLeft: {
    top: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    height: 40,
    paddingHorizontal: 15,
  },
  input: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  resultContainer: {
    marginTop: 30,
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 45,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
  },
  profileName: {
    color: 'white',
    fontSize: 16,
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
  },
  errorText: {
    color: 'white',
    marginTop: 20,
  },
});

export default Search;
