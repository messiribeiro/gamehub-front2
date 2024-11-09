import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import api from '../services/api';

interface Comment {
  id: number;
  content: string;
  user: {
    username: string;
    profilePictureUrl: string;
  };
  createdAt: string;
}

interface UserDetails {
  id: number;
  username: string;
  profilePictureUrl: string;
}

interface CommentSectionProps {
  postId: number;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);

      if (id) {
        try {
          const response = await api.get(`/api/users/${id}`);
          setUserDetails(response.data); // Armazena os detalhes do usuário
        } catch (error) {
          console.error('Erro ao buscar detalhes do usuário:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await api.get(`api/post/${postId}/details`);
      // Inverte a ordem dos comentários para que os mais recentes apareçam primeiro
      setComments(response.data.comments.reverse());
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await api.post(`api/post/${postId}/comment`, {
          userId,
          content: newComment,
        });
        setNewComment('');
        // Rebusca os comentários após adicionar um novo
        fetchComments();
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
      }
    }
  };
  const formatDate = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    else if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    else if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;
    else if (diffInSeconds < 2592000) return `há ${Math.floor(diffInSeconds / 86400)} d`;
    else if (diffInSeconds < 31536000) return `há ${Math.floor(diffInSeconds / 2592000)} mês`;
    else return `há ${Math.floor(diffInSeconds / 31536000)} ano`;
  };

  const handleGestureEvent = (event: any) => {
    if (event.nativeEvent.translationY > 100) {
      // Ajuste o valor de 100 conforme necessário
      onClose(); // Fecha o componente se o gesto for detectado
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={handleGestureEvent}>
        <View style={styles.container}>
          <Text style={styles.commentsCounterText}>
            {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
          </Text>
          <FlatList
            style={styles.commentsContainer}
            data={comments}
            keyExtractor={(item) => `${item.id}-${item.createdAt}`} // Combining id with createdAt to ensure uniqueness
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <View style={styles.photoAndContent}>
                  <Image
                    source={{
                      uri: item.user.profilePictureUrl || 'https://via.placeholder.com/45',
                    }}
                    style={styles.userImage}
                  />
                  <View style={styles.textContent}>
                    <View style={styles.usernameAndTime}>
                      <Text style={styles.text}>{item.user.username}</Text>
                      <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.inputContainer}>
            <View style={styles.inputAndImage}>
              <Image
                source={{
                  uri:
                    userDetails?.profilePictureUrl ||
                    'https://i.pinimg.com/originals/97/fd/40/97fd40b04ea88ae05c66332c64de4fa9.png',
                }}
                style={styles.myPhoto}
              />
              <TextInput
                style={styles.input}
                placeholderTextColor="white"
                placeholder="Adicione um comentário"
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity style={styles.sendIcon} onPress={handleAddComment}>
                <Feather name="arrow-right" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2B2C',
    padding: 5,
  },
  commentsCounterText: {
    alignSelf: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  photoAndContent: {
    flexDirection: 'row',
    gap: 10,
  },
  userImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
  },
  textContent: {
    width: '80%',
  },
  commentsContainer: {
    backgroundColor: '#2B2B2C',
    width: '100%',
    marginTop: 20,
  },
  usernameAndTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  text: {
    color: 'white',
  },
  timeText: {
    color: 'white',
    fontSize: 10,
  },
  commentText: {
    color: 'white',
    width: '95%',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignSelf: 'center',
    right: 4,
  },
  input: {
    height: 40,
    color: 'white',
    paddingHorizontal: 10,

    alignSelf: 'center',
    flex: 1,
  },
  inputAndImage: {
    width: '80%',
    height: 40,
    backgroundColor: '#727272',
    alignSelf: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  myPhoto: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  likeButton: {},
  sendIcon: {
    backgroundColor: '#D4E5FF',
    height: '100%',
    width: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CommentSection;
