import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import axios, { AxiosError } from 'axios';
import CommentSection from '../components/CommentSection';
import { Video, ResizeMode } from 'expo-av';
import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'react-native';

import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  Text,
  Modal,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {MaterialIcons} from '@expo/vector-icons';
import api from '../services/api';

import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'FullScreen'>;

const FullScreen = ({ route }: Props) => {
  const { postId } = route.params;
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState<number | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [postData, setPostData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const videoRef = useRef<any>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserId = async () => {
    const id = await AsyncStorage.getItem('userId');
    setUserId(id);
  };

  const fetchPostDetails = async () => {
    try {
      const response = await api.get(`/api/post/${postId}/details`);
      const { imageUrl, content, authorId, _count } = response.data;

      setVideoUri(imageUrl);
      setPostData({
        title: content,
        likes: _count.likes,
        comments: _count.comments,
        authorId,
      });
      setLikesCount(_count.likes);

      const userResponse = await api.get(`/api/users/${authorId}`);
      setUserData(userResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar detalhes do post:', error);
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userId) return;

    try {
      await api.post(`/api/post/${postId}/like`, { userId });
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    } catch (error) {
      const axiosError = error as AxiosError; // Asserção de tipo
      if (axiosError.response && axiosError.response.status === 409) {
        setLikesCount((prev) => Math.max(prev - 1, 0));
        setHasLiked(false);
      } else {
        console.error('Erro ao dar like:', axiosError);
      }
    }
  };

  // Definindo a função para abrir a seção de comentários
  const handleCommentButtonClick = (postId: number) => {
    setSelectedPostId(postId);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchUserId();
    fetchPostDetails();
  }, [postId]);

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
    setIsPlaying((prev) => !prev);
  };

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

  if (loading) {
    return <ActivityIndicator style={styles.loadingIndicator} size="large" color="#fff" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      {videoUri && (
        <View style={styles.videoContainer}>
          <TouchableWithoutFeedback onPress={togglePlayPause}>
            <View style={styles.touchableArea}>
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={isPlaying}
                isLooping
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              />
              {/* Exibir o ícone de carregamento enquanto o vídeo estiver carregando */}
              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={styles.loadingIndicator} // Adicione uma estilização para o carregador
                />
              )}
              {!isPlaying &&
                !loading && ( // Não mostrar o ícone de play se o vídeo estiver carregando
                  <View style={styles.playIconContainer}>
                    <Feather name="play" size={48} color="#fff" />
                  </View>
                )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
      <View style={styles.informations}>
        <View style={styles.userInformations}>
          {userData?.profilePictureUrl ? (
            <Image
              source={{ uri: userData.profilePictureUrl }}
              style={styles.userImage}
              onError={() => console.error('Erro ao carregar imagem do usuário')}
            />
          ) : (
            <View style={styles.userImagePlaceholder} />
          )}
          <View style={styles.userNameAndSubtitle}>
            <Text style={styles.text}>{userData?.username || 'Usuário Anônimo'}</Text>
            <Text style={styles.text}>{postData.title}</Text>
          </View>
        </View>
        <View style={styles.videoData}>
          <View style={styles.likes}>
            <TouchableOpacity onPress={handleLike}>
              <MaterialIcons
                name={hasLiked ? 'favorite' : 'favorite-border'}
                size={30}
                color={hasLiked ? '#FF4141' : '#fff'}
              />
            </TouchableOpacity>
            <Text style={styles.text}>{likesCount}</Text>
          </View>
          <TouchableOpacity onPress={() => handleCommentButtonClick(Number(postId))}>
            <View style={styles.comments}>
              <Feather name="message-circle" size={28} color="#fff" />
              <Text style={styles.text}>{postData.comments}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={{
            ...styles.progress,
            width: `${duration ? (position / duration) * 100 : 0}%`,
          }}
        />
      </View>
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
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  videoContainer: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  userImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
  },
  userImagePlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: 'gray',
  },
  userNameAndSubtitle: {},
  userInformations: {
    alignItems: 'center',
    paddingLeft: 15,
    flexDirection: 'row',
    gap: 5,
    top: '82%',
  },
  touchableArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  informations: {
    justifyContent: 'flex-end',
  },
  videoData: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: '200%',
    paddingRight: 15,
    gap: 15,
  },
  likes: {
    alignItems: 'center',
  },
  comments: {
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'black',
  },
  progress: {
    height: '100%',
    backgroundColor: '#5312C2',
  },
  text: {
    color: 'white',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Para escurecer o fundo
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 180,
    // Adicione qualquer estilo adicional que você queira
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default FullScreen;
