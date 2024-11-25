import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Video, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useState, useRef, useEffect } from 'react';
import { StatusBar, Keyboard} from 'react-native';

import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import api from '../services/api';

import GoBackAlert from '../components/GoBackAlert';
import { RootStackParamList } from '../navigation';

type Props = StackScreenProps<RootStackParamList, 'EditPostInfo'>;
interface Game {
  id: number;
  name: string;
  gameimageUrl: string;
  category: string;
}

const EditPostInfo = ({ navigation, route }: Props) => {
  const { photoUri, cameraType } = route.params;
  const isFrontCamera = cameraType === 'front';
  const [userId, setUserId] = useState<null | string>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [showMentionContainer, setShowMentionContainer] = useState<boolean>(false);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<Video>(null);
  const isVideo = photoUri && photoUri.endsWith('.mp4');
  const imageStyle = isFrontCamera ? styles.invertedImagePreview : styles.imagePreview;
  const [selectedGameId, setSelectedGameId] = useState<string | number | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleBackPress = () => {
    // Muda o estado para indicar que o botão de voltar foi pressionado
    if(showMentionContainer){
      console.log(showMentionContainer)
      setShowMentionContainer(false);
      return true
    }else {
      setShowMentionContainer(false);

      return false; 

    }

    // Impede o comportamento padrão (não deixar voltar para a tela anterior)
  };


  useEffect(() => {
    // Adiciona o ouvinte do botão de voltar quando o componente for montado
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Limpeza: remove o ouvinte quando o componente for desmontado
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const handleGamePress = (gameId: string | number): void => { 
    setSelectedGameId(gameId); // Atualiza o estado para o jogo selecionado
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);
        }
      } catch (error) {
        console.error('Erro ao obter userId', error);
      }
    };

    fetchUserId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const handleBeforeRemove = (e: any) => {
        if (!postSubmitted) {
          e.preventDefault();
          setModalVisible(true);
        }
      };

      if (!unsubscribeRef.current) {
        unsubscribeRef.current = navigation.addListener('beforeRemove', handleBeforeRemove);
      }

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }, [navigation, postSubmitted]) // Adiciona postSubmitted como dependência
  );

  const handleConfirmExit = () => {
    setModalVisible(false);

    if (postSubmitted) {
      // Se o post foi enviado, redirecione para a tela Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      // Se o post não foi enviado, apenas volte
      setTimeout(() => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'Camera' }],
        });
      }, 100);
    }
  };

  const handleTogglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  const fetchGames = async () => {
    try {
      const response = await api.get('/api/games');
      console.log(response.data)
      setGames(response.data)
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      setIsLoading(false);

    }
  };

  const handleSubmitPost = async () => {
    Keyboard.dismiss()
    fetchGames();
    setShowMentionContainer(true)
  };

  const submitPost = async () => {
    const formData = new FormData();

    if (userId !== null && userId !== undefined) {
      formData.append('authorId', userId.toString());
    } else {
      console.error('userId não está definido.');
      return;
    }

    formData.append('content', caption);
    if(selectedGameId) {
      formData.append('gameId', selectedGameId.toString());

    }

    if (photoUri) {
      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      if (fileInfo.exists) {
        const fileExtension = fileInfo.uri.split('.').pop()?.toLowerCase();

        let fileType = '';
        if (fileExtension === 'png') {
          fileType = 'image/png';
        } else if (fileExtension === 'jpeg' || fileExtension === 'jpg') {
          fileType = 'image/jpeg';
        } else if (fileExtension === 'mp4') {
          fileType = 'video/mp4'; // Suporte para vídeo
        } else {
          console.error('Tipo de arquivo não suportado:', fileExtension);
          return;
        }

        const file = {
          uri: photoUri,
          name: `arquivoDoUser${userId}.${fileExtension}`,
          type: fileType,
        };

        formData.append('file', file as any);
      } else {
        console.error('Arquivo não existe no caminho especificado.');
        return;
      }
    } else {
      console.error('photoUri não está definido.');
      return;
    }


    try {
      setIsSubmitting(true);
      const response = await api.post('/api/post/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPostSubmitted(true); // Define postSubmitted como true
      // Remova o listener de navegação
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      // Navegar diretamente para Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.log('erro: ', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#121212" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Feather style={styles.arrowLeft} name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isVideo ? 'Verifique seu Vídeo' : 'Verifique sua Imagem'}
          </Text>
        </View>
        <View style={styles.imageContainer}>
          {isVideo ? (
            <View>
              <Video
                ref={videoRef}
                source={{ uri: photoUri }}
                style={imageStyle}
                shouldPlay={isPlaying}
                isLooping
                onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                  if (status.isLoaded) {
                    if (status.didJustFinish) {
                      setIsPlaying(false);
                    }
                    setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
                    setCurrentTime(status.positionMillis ? status.positionMillis / 1000 : 0);
                  }
                }}
                onTouchEnd={handleTogglePlay}
              />
              <View style={styles.videoInfo}>
                <Text style={styles.timeText}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </View>
            </View>
          ) : (
            <Image source={{ uri: photoUri }} style={imageStyle} resizeMode="cover" />
          )}
        </View>
        <View style={styles.subtitleInput}>
          <TextInput
            style={styles.input}
            placeholder={`Adicione uma legenda ao ${isVideo ? 'seu vídeo' : 'sua imagem'}`}
            placeholderTextColor="white"
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmitPost}>
          <Text style={styles.publishText}>Publicar</Text>
        </TouchableOpacity>

        <GoBackAlert
          visible={isModalVisible}
          title={isVideo ? 'Descartar Vídeo?' : 'Descartar Imagem?'}
          message="As alterações serão perdidas"
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirmExit}
        />

        {showMentionContainer && (
          <View style={styles.mentionContainer}>
            <Text style={styles.mentionText} >Mencione algum jogo</Text>
            <TouchableOpacity style={styles.searchBar}>
              <Feather name="search" type="feather" size={20} color="#fff" />
              <Text style={styles.searchTitle}>Pesquisar jogo</Text>
            </TouchableOpacity>
            <ScrollView style={styles.gamesContainer}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                games.map((e) => (
                  <TouchableOpacity key={e.id} onPress={() => handleGamePress(e.id)}>
                    <View style={[styles.game, selectedGameId === e.id && styles.gameSelected]}>
                      <Image
                        source={{ uri: e.gameimageUrl }}
                        style={styles.gameImage}
                        onError={() => console.error('Erro ao carregar imagem do jogo')}
                      />
                      <Text style={styles.gameNameText}>{e.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.shareButton} onPress={submitPost}>
              <Text style={styles.shareText} >Compartilhar</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1B1E',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    justifyContent: 'center',
  },
  arrowLeft: {
    position: 'absolute',
  },
  title: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  text: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  imageContainer: {
    marginTop: 20,
    width: '100%',
    height: '45%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imagePreview: {
    width: "100%",
    height: "100%",

    borderRadius: 10,
    resizeMode: 'cover',
  },
  invertedImagePreview: {
    width: "100%",
    height: "100%",

    borderRadius: 10,
    resizeMode: 'cover',
    transform: [{ scaleX: -1 }],
  },
  videoInfo: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    padding: 5,
    borderRadius: 5,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  subtitleInput: {
    padding: 20,
    alignItems: 'center',
  },
  input: {
    height: 40,
    color: 'white',
    fontSize: 16,
  },
  button: {
    alignItems: 'center',
    marginTop: 60,
    height: 50,
    alignSelf: "center"

  },
  publishText: {
    color: "#529DFF",
    fontSize: 15,
    fontWeight: "500"
  },
  mentionContainer: {
    position: "absolute",
    width: 300,
    height: 400,
    backgroundColor: "#2B2B2C",
    alignSelf: "center",
    top: "50%",
    transform: [{ translateY: -200 }],
    borderRadius: 10,
    alignItems: "center",
    padding: 15,
  },
  mentionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingLeft: '3%',
    paddingRight: '3%',
  },
  searchTitle: {
    color: 'white',
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
    marginTop: 14,
    gap: 15
  },
  searchInput: {
    color: 'white',
    fontSize: 13,
  },

  gamesContainer: {
    marginTop: 20,
    width: "100%",
    gap: 5,
    height: "100%"
  },
  game: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: 5
  },

  gameSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: 5,
    backgroundColor: "#171717",
    borderRadius: 10,

  },
  gameImage: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  gameNameText: {
    color: "white",
    fontSize: 14
  },
  shareButton: {
    top: 5,
    // backgroundColor: "#5312C2",
    width: "108%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  shareText: {
    color: "#29BFFF",
    fontSize: 15,
    fontWeight: "bold"
  }
});

export default EditPostInfo;
