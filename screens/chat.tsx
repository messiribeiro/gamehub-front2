import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator, // Adicione o ActivityIndicator
} from 'react-native';
import api from '../services/api'; // Importando a configuração da API

import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'Chat'>;

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean; // Adiciona o campo isRead
  messageSender: {
    id: number;
    username: string;
    profilePictureUrl: string;
  };
  messageReceiver: {
    id: number;
    username: string;
    profilePictureUrl: string;
  };
}

const Chat = ({ navigation }: Props) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Estado para controlar se os dados foram carregados
  const defaultProfilePicture =
    'https://media.istockphoto.com/id/1185655985/vector/gamer-portrait-video-games-background-glitch-style-player-vector-illustration-online-user.jpg?s=612x612&w=0&k=20&c=uoy0NDqomF2RzJdrNFQM25WwVahjRggjDHYhQoNnx3M=';

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('userId');
      console.log(id);
      setUserId(id);
    })();
  }, []);

  const fetchMessages = async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/api/chat/user/${userId}`);
      const sortedMessages = response.data.sort((a: Message, b: Message) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const readMessages = await AsyncStorage.getItem('readMessages');
      const readMessagesArray = readMessages ? JSON.parse(readMessages) : [];

      const updatedMessages = sortedMessages.map((message: Message) => ({
        ...message,
        isRead: readMessagesArray.includes(message.id),
      }));

      setMessages(updatedMessages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setRefreshing(false);
      setDataLoaded(true); // Define como carregado após a requisição
    }
  };

  // Adiciona o listener para atualizar mensagens quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      fetchMessages(); // Chama a função para buscar as mensagens sempre que a tela receber foco

      return () => {
        // Cleanup se necessário
      };
    }, [userId]) // Adicionando userId como dependência
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

    // Verificação para evitar números negativos
    if (diffInSeconds < 0) return '0 seg';

    if (diffInSeconds < 60) return `há ${diffInSeconds} seg`;
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;
    return `há ${Math.floor(diffInSeconds / 86400)} d`;
  };

  const truncateMessage = (message: string, maxLength: number) => {
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    return message;
  };

  const handleChatPress = async (otherUserId: number, messageId: number, receiverName: string) => {
    const readMessages = await AsyncStorage.getItem('readMessages');
    const readMessagesArray = readMessages ? JSON.parse(readMessages) : [];

    if (!readMessagesArray.includes(messageId)) {
      readMessagesArray.push(messageId);
      await AsyncStorage.setItem('readMessages', JSON.stringify(readMessagesArray));
    }

    navigation.navigate('ChatWindow', {
      receiverId: otherUserId,
      receiverName,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>
      </View>
      <ScrollView
        style={styles.chats}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {!dataLoaded ? ( // Mostra o carregamento enquanto os dados não estão carregados
          <ActivityIndicator size="large" color="#ffffff" style={{ flex: 1 }} />
        ) : messages.length > 0 ? (
          messages
            .filter((msg) => msg.receiverId !== msg.senderId)
            .map((message: Message) => {
              const otherUserId =
                message.senderId === Number(userId) ? message.receiverId : message.senderId;
              const user =
                message.senderId === Number(userId)
                  ? message.messageReceiver
                  : message.messageSender;

              return (
                <TouchableOpacity
                  key={message.id}
                  onPress={() => handleChatPress(otherUserId, message.id, user.username)}>
                  <StatusBar barStyle="dark-content" backgroundColor="#121212" />

                  <View style={styles.chat}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{
                          uri:
                            user.profilePictureUrl &&
                            user.profilePictureUrl !== 'https://example.com/profile-picture.jpg'
                              ? user.profilePictureUrl
                              : defaultProfilePicture,
                        }}
                        style={styles.userImage}
                      />
                    </View>
                    <View style={styles.info}>
                      <View style={styles.content}>
                        <Text style={styles.userName}>{user.username}</Text>
                        <Text
                          style={[
                            styles.messagePreview,
                            {
                              fontWeight:
                                message.senderId === Number(userId)
                                  ? '400'
                                  : message.isRead
                                    ? '400'
                                    : '800',
                            },
                          ]}>
                          {message.senderId === Number(userId)
                            ? `Você: ${truncateMessage(message.content, 25)}` // Limite de 25 caracteres
                            : truncateMessage(message.content, 25)}
                        </Text>
                      </View>
                      <View style={styles.time}>
                        <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
        ) : (
          <View style={styles.noMessagesContainer}>
            <Text style={styles.noMessagesText}>Você ainda não tem conversas</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    width: '100%',
    height: '100%',
    color: 'white',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    height: '7%',
    backgroundColor: '#2B2B2C',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  chats: {
    padding: 10,
  },
  chat: {
    display: 'flex',
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    padding: 10,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50 / 2,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    color: 'white',
  },
  messagePreview: {
    fontWeight: '400',
    color: 'white',
  },
  time: {
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    color: 'white',
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessagesText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Chat;
