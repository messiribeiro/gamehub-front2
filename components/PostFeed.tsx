import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import { Video, ResizeMode as VideoResizeMode } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import api from '../services/api';

interface Post {
  id: number;
  content: string;
  imageUrl: string;
  authorId: number;
  createdAt: string;
}

interface UserData {
  id: number;
  username: string;
  profilePictureUrl: string;
  Subscription?: {
    isActive: boolean;
  };
}

interface PostFeedProps {
  post: Post;
  navigation: any;
  onCommentButtonClick: (postId: number) => void;
}

const PostFeed: React.FC<PostFeedProps> = ({ post, navigation, onCommentButtonClick }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const heartScale = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<any>(null);

  const fetchUser = async (authorId: number) => {
    const response = await api.get(`/api/users/${authorId}`);
    setUser(response.data);
  };

  const fetchPostDetails = async () => {
    const response = await api.get(`/api/post/${post.id}/details`);
    const { _count } = response.data;
    setLikesCount(_count.likes);
    setCommentsCount(_count.comments);
  };

  const handleLike = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    try {
      await api.post(`/api/post/${post.id}/like`, { userId });
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      animateHeart();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 409) {
          setLikesCount((prev) => Math.max(prev - 1, 0));
          setHasLiked(false);
          console.log('Usuário descurtiu este post.');
        } else {
          console.error('Erro ao dar like:', error.response?.data || error.message);
        }
      }
    }
  };

  const animateHeart = () => {
    heartScale.setValue(0.5);
    Animated.spring(heartScale, {
      toValue: 1.5,
      friction: 2,
      tension: 160,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      handleLike();
    }
    setLastTap(now);
  };

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };

    getUserId();

    if (post) {
      fetchUser(post.authorId);
      fetchPostDetails();

      // Iniciar o vídeo automaticamente ao carregar o componente
      if (isVideo(post.imageUrl)) {
        setActiveVideo(post.id);
      }
    }
  }, [post]);

  const handleMediaError = () => {
    console.error(`Erro ao carregar a mídia do post com ID: ${post.id}`);
    setMediaError(true);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handlePlayPause = () => {
    setActiveVideo(activeVideo === post.id ? null : post.id);
  };

  const isVideo = (url: string) => {
    return url.endsWith('.mp4') || url.endsWith('.mov');
  };

  const navigateToProfile = () => {
    if (user) {
      if (user.id.toString() === userId) {
        navigation.navigate('MyProfile');
      } else {
        navigation.navigate('Profile', { profileUserId: user.id });
      }
    }
  };

  const navigateToFullScreen = async () => {
    if (isVideo(post.imageUrl)) {
      if (activeVideo === post.id) {
        await videoRef.current.stopAsync(); // Para o vídeo
      }
      navigation.navigate('FullScreen', { postId: post.id });
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: pt,
  });

  const displayTime =
    differenceInSeconds(new Date(), new Date(post.createdAt)) < 60 ? 'Agora mesmo' : timeAgo;

  return (
    <View style={styles.post}>
      <View style={styles.user}>
        <TouchableOpacity onPress={navigateToProfile}>
          <Image
            style={styles.userImage}
            source={{
              uri: user?.profilePictureUrl || 'https://via.placeholder.com/40',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToProfile}>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>@{user?.username || 'Desconhecido'}</Text>
            {user?.Subscription?.isActive && (
              <MaterialIcons
                name="verified"
                size={16}
                color="#FFC000"
                style={styles.verifiedIcon}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.postTitle}>{post.content}</Text>
      <TouchableOpacity onPress={handleDoubleTap} activeOpacity={1}>
        {isVideo(post.imageUrl) ? (
          <View>
            <TouchableOpacity onPress={navigateToFullScreen}>
              <Video
                ref={videoRef}
                source={{ uri: post.imageUrl }}
                style={styles.postContent}
                resizeMode={VideoResizeMode.COVER}
                shouldPlay={activeVideo === post.id}
                isMuted={isMuted}
                onError={handleMediaError}
                isLooping
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
              <MaterialIcons name={isMuted ? 'volume-off' : 'volume-up'} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <Image
            style={styles.postContent}
            source={{ uri: post.imageUrl }}
            onError={handleMediaError}
          />
        )}
        <Animated.View style={[styles.heartIcon, { transform: [{ scale: heartScale }] }]}>
          <MaterialIcons name="favorite" size={80} color="rgba(255, 65, 65, 0.8)" />
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.dataView}>
        <View style={styles.postData}>
          <TouchableOpacity onPress={handleLike} style={styles.likesContainer}>
            <MaterialIcons
              name={hasLiked ? 'favorite' : 'favorite-border'}
              size={18}
              color={hasLiked ? '#FF4141' : '#fff'}
            />
            <Text style={styles.likes}>{likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onCommentButtonClick(post.id)}
            style={styles.commentsContainer}>
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={styles.comments}>{commentsCount}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.time}>{displayTime.replace('aproximadamente', '')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  post: {
    marginBottom: 20,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '3%',
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 5,
  },
  username: {
    color: 'white',
    textAlign: 'center',
  },
  postTitle: {
    color: 'white',
    marginTop: 5,
    paddingLeft: '3%',
  },
  postContent: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    marginTop: 10,
  },
  muteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 25,
    padding: 8,
  },
  dataView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  postData: {
    flexDirection: 'row',
    gap: 10,
  },
  commentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  comments: {
    color: 'white',
    marginLeft: 5,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likes: {
    color: 'white',
    marginLeft: 5,
  },
  time: {
    color: 'white',
    fontSize: 12,
  },
  verifiedIcon: {
    top: 1,
  },
  heartIcon: {
    position: 'absolute',
    top: '45%',
    left: '45%',
  },
});

export default PostFeed;
