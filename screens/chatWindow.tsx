/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-expressions */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import {Feather} from '@expo/vector-icons';
import api from '../services/api';
import { StatusBar } from 'react-native';


import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'ChatWindow'>;

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: Date;
  conversationId: number;
}

const ChatWindow = ({ navigation, route }: Props) => {
  const { receiverId } = route.params;
  const {receiverName} = route.params;
  const [userId, setUserId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ text: string; time: string; imageUri?: string }[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<{ text: string; time: string; imageUri?: string }[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [oldMessages, setOldMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Desculpe, precisamos de permissão para acessar a câmera!');
      }
    })();
  }, []);

  useEffect(() => {
    const getAllMessages = async () => {
      if (userId) {
        try {
          const response = await api.get(`api/chat/messages/${userId}/${receiverId}`);

          // Atualiza o estado com as mensagens retornadas
          setOldMessages(response.data.messages);
          setLoading(false); // Define como carregado

          // Exibe as mensagens no console
          

          setTimeout(() => {
          scrollToBottom();
        }, 100);

        } catch (error) {
          console.error('Erro ao buscar mensagens:', error);
          setLoading(false); // Define como carregado mesmo em erro
        }
      }
    };

    getAllMessages();
  }, [userId, receiverId]);

  const handleCameraPress = async () => {
    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newMessage = {
        text: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUri: result.assets[0].uri,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      scrollToBottom();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        text: inputValue,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputValue('');
      scrollToBottom();

      const apiConnection = async () => {
        try {
          const response = await api.post('api/chat/send', {
            senderId: Number(userId),
            receiverId: Number(receiverId),
            content: inputValue,
          });
          console.log(response.data);
        } catch (err) {
          console.error('Erro ao enviar mensagem:', err);
          return null;
        }
      };

      apiConnection();
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current && scrollEnabled) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    setContentHeight(contentHeight);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentHeight - 100;
    setScrollEnabled(isCloseToBottom);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <Text style={styles.headerText}>@{receiverName}</Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {loading ? ( // Se estiver carregando, mostra o indicador
          <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
        ) : (
          <>
            {oldMessages.map((message) => {
              const createdAt = new Date(message.createdAt); // Converter para Date
              if (String(message.senderId) === String(userId)) {
                return (
                  <View key={message.id} style={styles.sentContainer}>
                    <View style={styles.sentMessage}>
                      <Text style={styles.messageText}>{message.content}</Text>
                    </View>
                    <Text style={styles.timeTextSent}>
                      {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              } else {
                return (
                  <View key={message.id} style={styles.receivedContainer}>
                    <View style={styles.receivedMessage}>
                      <Text style={styles.messageText}>{message.content}</Text>
                    </View>
                    <Text style={styles.timeTextReceived}>
                      {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              }
            })}
            {receivedMessages.map((message, index) => (
              <View key={index} style={styles.receivedContainer}>
                {message.imageUri && (
                  <View style={styles.receivedContainerImage}>
                    <Image source={{ uri: message.imageUri }} style={styles.image} />
                  </View>
                )}
                {message.text && (
                  <View style={styles.receivedMessage}>
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                )}
                <Text style={styles.timeTextReceived}>{message.time}</Text>
              </View>
            ))}
            {messages.map((message, index) => (
              <View key={index} style={styles.sentContainer}>
                {message.imageUri && (
                  <View style={styles.sentContainerImage}>
                    <Image source={{ uri: message.imageUri }} style={styles.image} />
                  </View>
                )}
                {message.text && (
                  <View style={styles.sentMessage}>
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                )}
                <Text style={styles.timeTextSent}>{message.time}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
      <View style={styles.chatActionBar}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mensagem"
            placeholderTextColor="#888"
            multiline
            numberOfLines={1}
            value={inputValue}
            onChangeText={setInputValue}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.buttonContainer}>
            
              <Feather name="arrow-up" size={20} color="#000" />
            
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cameraContainer} onPress={handleCameraPress}>
          <Feather name="camera" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    width: '100%',
    height: '100%',
    color: 'white',
  },
  header: {
    width: '100%',
    height: '8%',
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
  messages: {
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 15,
    display: 'flex',
    paddingBottom: 30,
  },
  sentMessage: {
    maxWidth: 250,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 15,
    backgroundColor: '#5312C2',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    maxWidth: 250,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 15,
    backgroundColor: '#363636',
    alignSelf: 'flex-start',
  },
  sentContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 15,
  },

  receivedContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  sentContainerImage: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 15,
  },

  receivedContainerImage: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 15,
  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 14,
  },
  messageText: {
    color: 'white',
  },
  timeTextSent: {
    color: 'white',
    fontSize: 10,
    marginTop: 5,
    left: -8,
  },
  timeTextReceived: {
    color: 'white',
    fontSize: 10,
    marginTop: 5,
    right: -8,
  },
  inputContainer: {
    width: '70%',
    minHeight: 45,
    maxHeight: 80,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#2B2B2C',
    marginBottom: 20,
    borderRadius: 15,
  },
  input: {
    width: '86%',
    color: 'white',
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 5,
  },
  buttonContainer: {
    backgroundColor: '#D4E5FF',
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  chatActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cameraContainer: {
    backgroundColor: '#D4E5FF',
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    top: '-2.5%',
  },
  loadingIndicator: {
    marginTop: 350, // Adicione algum espaçamento para o indicador
    alignSelf: 'center', 
  },
});

export default ChatWindow;